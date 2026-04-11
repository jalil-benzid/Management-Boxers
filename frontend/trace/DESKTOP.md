sudo apt update
sudo apt install -y \
  libglib2.0-dev \
  libgtk-3-dev \
  libwebkit2gtk-4.1-dev \
  build-essential \
  curl \
  wget \
  file \
  libssl-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev

pake http://localhost:5173/login \
  --name "Boxers Manager" \
  --icon ./logo.png

sudo dpkg -i admin-boxers-manager.deb