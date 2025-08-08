# Chamkili AI Blog Writer 🌟

An advanced AI-powered blog writing application designed specifically for Chamkili's content marketing needs. Features include intelligent blog generation, SEO optimization, internal linking, and direct Shopify publishing.

## ✨ Key Features

- **AI-Generated Content**: Smart blog outlines and full articles using Google Gemini AI
- **Internal Blog Linking**: Automatically fetches and links to related Chamkili blog posts
- **SEO Optimization**: Built-in SEO scoring and metadata generation
- **Shopify Integration**: Direct publishing to your Shopify blog
- **Brand Voice Analysis**: Maintains consistent brand voice across all content
- **Image Generation**: AI-powered image creation with multiple style options
- **Campaign Planning**: Full marketing campaign generation
- **Content Repurposing**: Transform blogs into social media content
- **Customer Persona Targeting**: AI-generated customer personas for better targeting
- **Trend Analysis**: Stay up-to-date with latest skincare trends
- **Competitor Analysis**: Analyze competitor content for better positioning

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- A Google Gemini AI API key
- Shopify store with API access (optional)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/zunairkalyar/chamkili-ai-blog-writer-5.git
   cd chamkili-ai-blog-writer-5
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your API keys:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   VITE_SHOPIFY_STORE_NAME=your-store-name
   VITE_SHOPIFY_ACCESS_TOKEN=your_shopify_access_token
   ```

4. **Run locally:**
   ```bash
   npm run dev
   ```

## 🌐 Deploy to Vercel

### Option 1: Deploy from GitHub (Recommended)

1. **Push to GitHub** (already done)
2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository
   - Add environment variables in Vercel dashboard:
     - `VITE_GEMINI_API_KEY`
     - `VITE_SHOPIFY_STORE_NAME` 
     - `VITE_SHOPIFY_ACCESS_TOKEN`
3. **Deploy!** - Vercel will automatically build and deploy

### Option 2: Direct Vercel CLI Deploy

```bash
npx vercel
# Follow the prompts and add environment variables
```

## 🔧 Configuration

### Gemini AI Setup
1. Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add to your `.env` file as `VITE_GEMINI_API_KEY`

### Shopify Setup
1. Go to your Shopify admin → Apps → Develop apps
2. Create a private app with these scopes:
   - `read_content`
   - `write_content` 
   - `read_blogs`
   - `write_blogs`
3. Add store name and access token to `.env`

### Internal Linking
The app automatically fetches your blog sitemap from:
`https://your-store.com/sitemap_blogs_1.xml`

No additional setup required! 🎉

## 📱 Usage

1. **Dashboard View**: Overview of content calendar and quick actions
2. **Blog Generator**: Create individual blog posts with AI
3. **Campaign Planner**: Generate complete marketing campaigns
4. **Settings**: Configure AI models and API keys
5. **Content Library**: View and manage your blog post history

## 🛠️ Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **AI**: Google Gemini 2.0 Flash
- **Deployment**: Vercel
- **CMS**: Shopify Blog API

## 🔒 Security

- All API keys are stored as environment variables
- No sensitive data is committed to git
- CORS proxy handles Shopify API requests securely

## 📞 Support

For questions or issues:
1. Check the GitHub Issues page
2. Review the configuration settings
3. Ensure all environment variables are set correctly

## 🎯 Roadmap

- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Automated posting scheduler
- [ ] Enhanced image generation options
- [ ] WordPress integration

---

**Built with ❤️ for Chamkili Beauty**
