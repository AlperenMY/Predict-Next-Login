# Predict Next Login

Bu proje, kullanıcıların geçmiş login verilerini analiz ederek **bir sonraki olası login zamanını** tahmin etmeyi amaçlayan bir web uygulamasıdır.  
Tahminler kullanıcı dostu bir arayüzde gösterilir ve hem basit algoritmalar hem de OpenAI desteğiyle yapılır.

## Projenin Yapısı

- **Backend (API)**: Login verilerini analiz eder, tahminleri üretir.
- **Frontend (UI)**: Kullanıcı arayüzü; tahmin sonuçlarını listeler.

---

## Kullanılan Teknolojiler

### Backend

- **Node.js** + **Express**
- **Axios** (API istekleri için)
- **dotenv** (Ortam değişkenleri için)
- **CORS**
- **Nodemon** (Geliştirme sırasında otomatik yeniden başlatma için)

### Frontend

- **React 18** + **Vite**
- **Axios** (API çağrıları için)

---

## Kurulum ve Çalıştırma Adımları

### 1) Backend Kurulumu

Login tahmin API'sini başlatmak için:

```bash
cd api
npm install
```

#### Ortam Değişkenleri

Bir `.env` dosyası oluşturun ve içine aşağıdakini ekleyin:

```
OPENAI_API_KEY=YOUR_OPENAI_API_KEY_HERE
FRONTEND_URL=http://localhost:5173
```

#### Backend’i Çalıştır

```bash
npm start
```

API `http://localhost:3000` adresinde çalışır.  
Frontend tarafı **http://localhost:5173** üzerinden API’ye bağlanır (CORS bu portu destekleyecek şekilde ayarlı).

---

### 2) Frontend (UI) Kurulumu

Web arayüzünü başlatmak için:

```bash
cd ui
npm install
```

#### Ortam Değişkenleri

Bir `.env` dosyası oluşturun ve içine aşağıdakini ekleyin:

```
VITE_API_URL=http://localhost:3000
```

#### Frontend’i Çalıştır

```bash
npm run dev
```

Arayüz genellikle `http://localhost:5173` adresinde açılır.

---

## Nasıl Çalışır?

- Kullanıcı login verileri `http://case-test-api.humanas.io` adresinden çekilir.
- **Backend** tarafı, login zaman serisine 3 farklı yöntem uygular:
  - Ortalama zaman aralığına göre tahmin
  - Ortalama gün içi saatine göre tahmin
  - **OpenAI (GPT-4.1-mini)** modeliyle tahmin
- Sonuçlar **Frontend** tarafına JSON formatında döner ve kullanıcıya gösterilir.

---

## API Endpointi

```
GET /predictLogins
```

#### Yanıt Formatı:

```json
{
  "success": true,
  "message": [
    {
      "id": 1,
      "name": "John Doe",
      "predictions": {
        "last_login": "2025-05-08T12:00:00Z",
        "average_interval": "2025-05-10T12:00:00Z",
        "average_interval_acc": "85",
        "average_time_of_day": "2025-05-10T09:30:00Z",
        "average_time_of_day_acc": "80",
        "ai_prediction": "2025-05-09T14:15:00Z"
      }
    },
    ...
  ]
}
```

---

## Özel Yapılandırmalar

- **CORS** ayarı, sadece `http://localhost:5173` adresinden gelen istekleri kabul eder.
- OpenAI tahminleri için geçerli bir `OPENAI_API_KEY` gereklidir.
- Frontend tarafı doğrudan backend’in `/predictLogins` endpointini çağırır.

---

## Geliştirici Notları

- Frontend `Vite` ile hızlı geliştirme deneyimi sunar.
- Backend'teki `evaluatePredictionAccuracy` fonksiyonu, algoritmaların doğruluk oranını yüzdesel olarak hesaplar.
- OpenAI API çağrısı sırasında `gpt-4.1-mini` modeli kullanılır.

---

## Çalışma Portları

| Bileşen         | Adres                 |
| --------------- | --------------------- |
| **Backend API** | http://localhost:3000 |
| **Frontend UI** | http://localhost:5173 |

---

## Yazar

👤 Alperen Yılmaz  
[GitHub Profilim](https://github.com/AlperenMY)

---

## Kurulumdan Sonra Görülebilecek Hatalar

- OpenAI API limiti aşılırsa `/predictLogins` yanıtı `ai_prediction: null` dönebilir.
- API `case-test-api.humanas.io` erişilemezse, backend 500 hatası verir.

---

## Katkı

PR’ler ve geliştirme katkıları memnuniyetle kabul edilir. 🚀
