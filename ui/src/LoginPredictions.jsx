import React, { useEffect, useState } from "react";
import axios from "axios";

function LoginPredictions() {
	const [data, setData] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		axios
			.get("http://localhost:3000/predictLogins")
			.then((result) => {
				setData(result.data.message);
				setLoading(false);
			})
			.catch((error) => {
				console.error("API Error:", error);
				setLoading(false);
			});
	}, []);

	if (loading) return <p>Yükleniyor...</p>;

	return (
		<div style={{ padding: "20px" }}>
			<h2>Kullanıcı Login Tahminleri</h2>
			<table
				border="1"
				cellPadding="8"
				style={{ borderCollapse: "collapse", width: "100%" }}
			>
				<thead>
					<tr>
						<th>Kullanıcı Adı</th>
						<th>Son Login</th>
						<th>Ortalama Aralık Tahmini</th>
						<th>Ortalama Saat Tahmini</th>
						<th>AI Tahmini (LLM)</th>
					</tr>
				</thead>
				<tbody>
					{data.map((user) => (
						<tr key={user.id}>
							<td>{user.name}</td>
							<td>{formatDate(user.predictions.last_login)}</td>
							<td>
								{`${formatDate(user.predictions.average_interval)}`}
								<br />
								{`Doğruluk Yüzdesi ${
									user.predictions.average_interval_acc ?? "Hesaplanamadı"
								}`}
							</td>
							<td>
								{`${formatDate(user.predictions.average_time_of_day)}`}
								<br />
								{`Doğruluk Yüzdesi ${
									user.predictions.average_time_of_day_acc ?? "Hesaplanamadı"
								}`}
							</td>
							<td>{`${formatDate(user.predictions.ai_prediction)}`}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

function formatDate(isoString) {
	if (!isoString) return "-";
	const date = new Date(isoString);
	return date.toLocaleString("tr-TR", {
		dateStyle: "short",
		timeStyle: "short",
	});
}

export default LoginPredictions;
