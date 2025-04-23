# Rephoria Demo

AI-powered call center analytics and insights platform.

## Setup Instructions

1. Clone this repository:
```bash
git clone <repository-url>
cd rephoria-demo
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory with your OpenAI API key:
```bash
OPENAI_API_KEY=your_api_key_here
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- Real-time call transcription and analysis
- AI-powered insights and follow-up suggestions
- Performance analytics and agent metrics
- Interactive dashboards

## Requirements

- Node.js 16.x or later
- OpenAI API key
- Modern web browser

## Notes

- The application uses OpenAI's Whisper for transcription and GPT-3.5 for analysis
- Audio files supported: MP3, WAV, M4A
- Make sure your OpenAI API key has sufficient credits 