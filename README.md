# 🧠 VidyaBase  
*Generate a structured knowledge base from any video.*

---

## 📽️ Overview  
**VidyaBase** automatically converts videos into clean, summarized knowledge.  
Upload an `.mp4` file and watch as it:  
1. Extracts audio from the video.  
2. Splits audio into 30-second chunks.  
3. Transcribes and summarizes each chunk in parallel.  
4. Builds a searchable **knowledge base** from the summaries.  

## ✨ Features  
- 🎥 Upload `.mp4` videos directly  
- 🔊 Automatic audio extraction and splitting  
- ⚙️ Parallel transcription and summarization  
- 📚 Generates a clean, structured knowledge base  
- 💬 Markdown rendering for summaries  
- ⚡ Real-time loading and progress animations  
- 🧠 Factual, concise summaries powered by LLMs  

---

## 🧰 Tech Stack  
| Category | Tools |
|-----------|--------|
| **Frontend** | React / Next.js |
| **Audio Processing** | FFmpeg (via @ffmpeg/ffmpeg) |
| **Transcription** | Gemini Prompt API |
| **Styling & UI** | TailwindCSS |
| **Markdown Rendering** | `react-markdown` |

---
## 🧱 Prerequisites  

Before running **VidyaBase**, make sure your setup meets the following requirements:  

### 🧭 Browser Requirements  
VidyaBase relies on **on-device AI capabilities** available only in the latest versions of Chrome.  
- Download and install the **latest Chrome (Stable Channel)** from:  
  👉 [https://www.google.com/chrome/](https://www.google.com/chrome/)  


## ⚙️ Installation  

```bash
git clone https://github.com/Deepakeon/vidya-base.git
cd vidya-base

npm install

npm run dev

```
## 🏆 Hackathon Submission

This repository was created as a submission for **Google Chrome Built-in AI Challenge 2025**. 

- **Challenge:** Develop a new web application or Chrome Extension that uses one or more APIs to interact with Chrome’s built-in AI models, such as Gemini Nano
- **Timeline:** Built in 5 days.
- **Submission:** https://devpost.com/software/vidya-base?ref_content=user-portfolio&ref_feature=in_progress

## ⚖️ License
This project is licensed under the [MIT License](./LICENSE).
