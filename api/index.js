if (process.env.NODE_ENV !== "production") {
	require("dotenv").config();
}
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(express.json());
app.use(
	cors({
		origin: process.env.FRONTEND_URL,
		methods: ["GET"],
	})
);
/**
 * Compute the average interval (in ms) between successive login timestamps.
 * @param {number[]} logins - array of timestamps (ms since epoch), sorted ascending.
 * @returns {number|null} average interval in ms, or null if not computable.
 */
const findAverageInterval = (logins) => {
	if (!Array.isArray(logins) || logins.length < 2) return null;
	//Login zamanları arasındaki farkların toplamı
	const totalInterval = logins.reduce((accumulator, current, index, array) => {
		if (index < array.length - 1)
			return accumulator + (array[index + 1] - current);
		else return accumulator;
	}, 0);

	return Math.round(totalInterval / (logins.length - 1));
};
/**
 * Kullanıcının geçmiş login zamanlarına göre ortalama aralıkla bir sonraki login tarihini tahmin eder.
 *
 * @param {number[]} logins - Zaman damgası (timestamp) formatında login tarihleri dizisi.
 * @returns {string} ISO 8601 formatında tahmini login tarihi.
 */
const predictNextLoginByAverageInterval = (logins) => {
	const averageInterval = findAverageInterval(logins);
	if (averageInterval == null) return null;

	const lastLogin = logins[logins.length - 1];

	return new Date(lastLogin + averageInterval).toISOString();
};
/**
 * Ortalama gün içi saat algoritması: Bu algoritma ile günün ortalama hangi saatinde login olduğu bulunur.
 * Ortalama kaç günde bir login olduğuna bkıldıktan sonra son login tarihine ilk önce ortalama gün sonrasında saat eklenir
 *
 * @param {string[]} logins - Zaman damgası (timestamp) formatında login tarihleri dizisi.
 * @returns {string} ISO 8601 formatında tahmini login tarihi.
 */
const predictNextLoginByAverageTimeOfDay = (logins) => {
	if (!Array.isArray(logins) || logins.length < 2) return null;

	let totalMinutes = logins.reduce((accumulator, current) => {
		const date = new Date(current);
		const minutes = date.getHours() * 60 + date.getMinutes();
		return accumulator + minutes;
	}, 0);

	const averageMinutes = Math.round(totalMinutes / logins.length);
	const averageHour = Math.floor(averageMinutes / 60);
	const averageMinute = averageMinutes % 60;

	const averageInterval = findAverageInterval(logins);
	// ortalama login zamanının gün bazına çevrimi
	const intervalInDays = Math.ceil(averageInterval / (1000 * 60 * 60 * 24));

	const lastLogin = new Date(logins[logins.length - 1]);
	lastLogin.setDate(lastLogin.getDate() + intervalInDays);
	lastLogin.setHours(averageHour, averageMinute, 0, 0);
	return lastLogin.toISOString();
};

/**
 * OpenAI API'si kullanarak geçmiş login verisine göre bir sonraki login tahminini yapar.
 *
 * @param {string[]} logins - Zaman damgası (timestamp) formatında login tarihleri dizisi.
 * @returns {Promise<string|null>} ISO 8601 formatında tahmini login tarihi veya hata durumunda null.
 */
const predictNextLoginWithOpenAI = async (logins) => {
	try {
		const prompt = `Kullanıcı login tarihleri: 
                        ${logins.join("\n")} 
                        Bu login geçmişine göre, kullanıcının bir sonraki login tarihi ve saati ne olur? 
                        Sonuç için yeterli veri olmasa da cevap yorumsuz olarak sadece ISO 8601 formatında bir tarih içersin. (Örnek: 2025-04-03T19:36:00Z)`;

		const response = await axios.post(
			"https://api.openai.com/v1/chat/completions",
			{
				model: "gpt-4.1-mini",
				temperature: 0.8,
				messages: [
					{
						role: "system",
						content:
							"Sen bir zaman serisi tahmin uzmanısın. Sadece bir sonraki login zamanını tahmin edeceksin.",
					},
					{ role: "user", content: prompt },
				],
			},
			{
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
				},
			}
		);

		return response.data.choices[0].message.content;
	} catch (error) {
		console.error("OpenAI API call failed:", error);
		return null;
	}
};

/**
 * Tahmin edilen ve gerçek login tarihleri arasındaki farkı saat cinsinden hesaplar.
 *
 * @param {string} predictedDate - ISO 8601 formatında tahmin edilen login tarihi.
 * @param {string} actualDate - ISO 8601 formatında gerçek login tarihi.
 * @returns {number} Saat cinsinden fark.
 */
const calculateErrorInHours = (predictedDate, actualDate) => {
	const predicted = new Date(predictedDate);
	const actual = new Date(actualDate);
	const diffMs = Math.abs(predicted - actual);
	return diffMs / (1000 * 60 * 60); // saate çevir
};

/**
 * Verilen tahmin fonksiyonunun doğruluğunu yüzde olarak hesaplar.
 *
 * @param {number[] } logins - Login tarihleri dizisi.
 * @param {(logins: number[]) => string} predictFunction - Tahmin fonksiyonu.
 * @returns {string|null} Doğruluk yüzdesi (string olarak) veya veri yetersizse null.
 */
const evaluatePredictionAccuracy = (logins, predictFunction) => {
	if (logins.length < 7) return null;

	const start = logins.length - 3; //Son üç login tarihini tahmin edip doğruluk oranı hesaplanacak
	let totalError = 0;

	for (let i = start; i < logins.length; i++) {
		const past = logins.slice(0, i);
		const real = logins[i];
		const predicted = predictFunction(past);
		totalError += calculateErrorInHours(predicted, real);
	}

	const maeHours = totalError / 3;
	let accuracy = 100 - (maeHours / 48) * 100;
	accuracy = Math.max(0, Math.min(100, accuracy));

	return accuracy.toFixed();
};

app.get("/predictLogins", async (req, res) => {
	try {
		const response = await axios.get("http://case-test-api.humanas.io");
		const users = response.data.data.rows;

		const result = await Promise.all(
			users.map(async (user) => {
				const sortedTimestamps = user.logins
					.map((date) => new Date(date).getTime())
					.sort((a, b) => a - b);

				return {
					id: user.id,
					name: user.name,
					predictions: {
						last_login: user.logins[user.logins.length - 1],
						average_interval: predictNextLoginByAverageInterval(sortedTimestamps),
						average_interval_acc: evaluatePredictionAccuracy(
							sortedTimestamps,
							predictNextLoginByAverageInterval
						),
						average_time_of_day: predictNextLoginByAverageTimeOfDay(sortedTimestamps),
						average_time_of_day_acc: evaluatePredictionAccuracy(
							sortedTimestamps,
							predictNextLoginByAverageTimeOfDay
						),
						ai_prediction: await predictNextLoginWithOpenAI(sortedTimestamps),
					},
				};
			})
		);

		return res.status(200).send({
			success: true,
			message: result,
		});
	} catch (error) {
		console.log("API error", error);
		return res.status(500).send({
			success: false,
			message: `Something went wrong: ${error.message}`,
		});
	}
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`LISTENING ON PORT 3000`);
});
