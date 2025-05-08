# Login Prediction App

Bu repo, basit bir "login prediction" uygulamasını içerir.

- **Backend**: Express.js (Node.js)
- **Frontend**: React (Vite)

## Proje Yapısı

root
│
├── api # Backend (Node.js + Express)
│ └── package.json
│
└── ui # Frontend (React + Vite)
└── package.json

markdown
Kopyala
Düzenle

## Deploy (Render.com)

### 🔥 Backend Deploy (api)

1. Render’a gir → **New → Web Service** seç
2. Repo olarak `api` klasörünü seç
3. **Build Command:**
   npm install

markdown
Kopyala
Düzenle 4. **Start Command:**
npm start

markdown
Kopyala
Düzenle 5. Environment → `PORT` Render tarafından otomatik atanır

### 🔥 Frontend Deploy (ui)

1. Render’a gir → **New → Web Service** seç
2. Repo olarak `ui` klasörünü seç
3. **Build Command:**
   npm install && npm run build

markdown
Kopyala
Düzenle 4. **Start Command:**
npm run preview -- --port $PORT

yaml
Kopyala
Düzenle 5. Environment → `PORT` Render tarafından otomatik atanır

6. `vite.config.js` dosyasında Render domainlerini izinli host olarak ekle:

```js
preview: {
  port: 4173,
  host: true,
  allowedHosts: ['.onrender.com']
}
.env Kullanımı
Frontend ile backend doğru konuşabilsin diye environment variable kullandık.

Backend (api/.env)
ini
Kopyala
Düzenle
PORT=3000
Frontend (ui/.env)
ini
Kopyala
Düzenle
VITE_API_URL=https://your-backend-service.onrender.com
⚠️ VITE_ prefix’i zorunludur. Vite sadece VITE_ ile başlayan değişkenleri alır.

Frontend Kod Örneği
js
Kopyala
Düzenle
import axios from 'axios';

axios.get(`${import.meta.env.VITE_API_URL}/predictLogins`)
  .then(response => {
    console.log(response.data);
  });
Local Geliştirme
Backend Çalıştırma
bash
Kopyala
Düzenle
cd api
npm install
npm start
👉 http://localhost:3000 adresinde çalışır.

Frontend Çalıştırma
bash
Kopyala
Düzenle
cd ui
npm install
npm run dev
👉 http://localhost:5173 adresinde çalışır.
```
