npm create vite@latest frontend
cd frontend
cd src
rm App.css index.css
mkdir components pages layouts routes services hooks types assets

src/
│
├── assets/        # images, icons
├── components/    # reusable UI components (Button, Card…)
├── hooks/         # custom React hooks
├── layouts/       # page layouts (Navbar, Sidebar…)
├── pages/         # pages (Home, Login…)
├── routes/        # routing config
├── services/      # API calls (backend communication)
├── types/         # TypeScript types
│
├── App.tsx
├── main.tsx

cd ..
npm install react-router-dom

npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

rm -rf node_modules package-lock.json
npm install
npm install -D tailwindcss@latest postcss autoprefixer

nvm install 20
nvm use 20

rm -rf node_modules package-lock.json
npm install

nvm alias default 20

npx tailwindcss init -p


npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

npm install -D @tailwindcss/vite
cat > vite.config.ts << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})
EOF

cat > src/index.css << 'EOF'
@import "tailwindcss";
EOF


