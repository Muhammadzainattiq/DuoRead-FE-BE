# DuoRead - Setup Instructions

## Installation

1. Clone the repository:
```bash
git clone <YOUR_GIT_URL>
cd DuoRead-FE-Chrome
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
VITE_API_BASE_URL=https://zainattiq-duoread.hf.space
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:8080`

## Build for Production

```bash
npm run build
```

## Preview Production Build

```bash
npm run preview
```
