# Chamkili Auto Blog Poster

🤖 **Automated AI-powered blog generation and publishing system for your Chamkili Shopify store**

This system automatically generates high-quality, SEO-optimized blog posts using Google's Gemini AI and publishes them directly to your Shopify store blog every 10 minutes (or any interval you configure).

## 📋 Features

- ✅ **Automatic Blog Generation**: Uses Google Gemini AI to create engaging blog posts
- ✅ **SEO Optimized**: Generates meta titles, descriptions, and keyword-optimized content
- ✅ **Shopify Integration**: Publishes directly to your Shopify store blog
- ✅ **Configurable Schedule**: Run every 10 minutes, hourly, daily, or any custom interval
- ✅ **Customizable Content**: 20+ predefined skincare topics with multiple tones and styles
- ✅ **Error Handling**: Graceful error handling with fallback mechanisms
- ✅ **Easy Configuration**: Simple JSON configuration file

## 🚀 Quick Start

### Prerequisites

1. **Node.js** (version 16 or higher) - Download from [nodejs.org](https://nodejs.org/)
2. **Shopify Store** with admin access
3. **Google Gemini API Key** (included in the configuration)

### Installation

1. **Double-click** `start-auto-poster.bat` to automatically:
   - Check if Node.js is installed
   - Install required dependencies
   - Start the auto-poster service

2. **Manual Installation** (Alternative):
   ```bash
   # Install dependencies
   npm install @google/generative-ai node-fetch node-cron

   # Start the service
   node auto-poster.js
   ```

## ⚙️ Configuration

Edit `config.json` to customize your auto-poster settings:

### Schedule Configuration
```json
{
  "schedule": {
    "interval": "*/10 * * * *",
    "description": "Every 10 minutes"
  }
}
```

**Common Schedule Examples:**
- `*/10 * * * *` - Every 10 minutes
- `0 */1 * * *` - Every hour
- `0 9 * * *` - Every day at 9 AM
- `0 9 * * 1-5` - Every weekday at 9 AM

### Blog Topics Configuration
Add or modify blog topics in the `blogSettings.topics` array:
```json
{
  "blogSettings": {
    "topics": [
      "Your Custom Blog Topic Here",
      "Another Great Skincare Topic",
      // Add as many as you want
    ]
  }
}
```

### AI Model Configuration
```json
{
  "gemini": {
    "apiKey": "your-api-key-here",
    "model": "gemini-2.0-flash-exp"
  }
}
```

### Shopify Configuration
```json
{
  "shopify": {
    "storeName": "your-store-name",
    "accessToken": "your-access-token"
  }
}
```

## 📝 How It Works

1. **Content Generation**: The system randomly selects a blog topic, tone, and style from your configuration
2. **AI Processing**: Uses Google Gemini AI to create a detailed outline and full blog post
3. **SEO Optimization**: Generates meta titles, descriptions, and FAQ sections
4. **Publishing**: Automatically publishes the complete blog post to your Shopify store
5. **Scheduling**: Repeats the process based on your configured schedule

## 📊 Generated Content Includes

- 📖 **Comprehensive Blog Posts** (800-1500 words)
- 🎯 **SEO-optimized titles and meta descriptions**
- 🏷️ **Relevant keywords integration**
- 📸 **Image suggestions** (placeholder text)
- ❓ **FAQ sections**
- 🔗 **Call-to-action sections**
- 📱 **Mobile-friendly HTML formatting**

## 🛠️ Management Commands

### Start the Service
```bash
# Windows
start-auto-poster.bat

# or manually
node auto-poster.js
```

### Stop the Service
- Press `Ctrl+C` in the terminal window
- Or close the command prompt window

### Check Service Status
The service provides real-time logs showing:
- ✅ Successful blog generations
- ❌ Error notifications
- ⏰ Next scheduled run time
- 📊 Configuration details

## 📋 Monitoring

The auto-poster provides detailed console output:

```
🤖 Chamkili Auto Blog Poster starting...
📅 Schedule: Every 10 minutes
🎯 Blog Topics: 20 topics available
🤖 AI Model: gemini-2.0-flash-exp
🏪 Shopify Store: your-store-name

🚀 Starting automatic blog generation...
📝 Blog config: {title: "Best Korean Skincare...", tone: "Professional"...}
Generating blog outline for: Best Korean Skincare Routine for Pakistani Skin
Generating full blog content...
Generating SEO metadata...
Publishing to Shopify...
✅ Article published successfully! Shopify ID: 12345678
✨ Blog generation and publishing completed successfully!
```

## 🔧 Troubleshooting

### Common Issues

1. **Node.js not installed**
   ```
   ❌ Node.js is not installed. Please install Node.js from https://nodejs.org/
   ```
   **Solution**: Install Node.js from the official website

2. **Shopify API Error**
   ```
   Shopify API Error (401): Unauthorized
   ```
   **Solution**: Check your Shopify store name and access token in `config.json`

3. **Gemini API Error**
   ```
   Error generating blog content: API key invalid
   ```
   **Solution**: Verify your Gemini API key in `config.json`

### Log Files
The service outputs all logs to the console. To save logs to a file:
```bash
node auto-poster.js > auto-poster.log 2>&1
```

## 📁 File Structure

```
chamkili-ai-blog-writer/
├── auto-poster.js              # Main auto-posting service
├── config.json                 # Configuration file
├── package-auto-poster.json    # Node.js dependencies
├── start-auto-poster.bat      # Windows startup script
└── README-AUTO-POSTER.md      # This documentation
```

## 🔒 Security Notes

- Keep your API keys secure and never share them publicly
- The `config.json` file contains sensitive information
- Consider using environment variables for production deployments

## 📈 Performance

- **Generation Time**: 2-5 minutes per blog post
- **Content Quality**: High-quality, unique content every time
- **SEO Score**: Optimized for search engines with relevant keywords
- **Resource Usage**: Low CPU and memory footprint

## 🆘 Support

If you encounter any issues:

1. Check the console output for error messages
2. Verify your configuration in `config.json`
3. Ensure your Shopify store and API access are working
4. Make sure your Gemini API key is valid

## 📋 Schedule Examples

Change the `schedule.interval` in `config.json`:

| Frequency | Cron Expression | Description |
|-----------|----------------|-------------|
| Every 5 minutes | `*/5 * * * *` | For testing |
| Every 10 minutes | `*/10 * * * *` | Default setting |
| Every 30 minutes | `*/30 * * * *` | Moderate frequency |
| Every hour | `0 */1 * * *` | Hourly posts |
| Every 2 hours | `0 */2 * * *` | Less frequent |
| Daily at 9 AM | `0 9 * * *` | Once per day |
| Weekdays at 9 AM | `0 9 * * 1-5` | Business days only |

## 🎯 Content Customization

### Adding New Topics
Edit the `topics` array in `config.json`:
```json
"topics": [
  "Your Custom Topic Here",
  "Another Great Topic",
  // Keep adding more...
]
```

### Changing Tone and Style
Modify the tone and style options:
```json
"tones": ["Professional", "Friendly", "Expert", "Casual"],
"contentTemplates": ["Standard Blog Post", "How-To Guide", "Product Review"],
"authorPersonas": ["Skincare Expert", "Beauty Blogger", "Dermatologist"]
```

---

**🌟 Enjoy your automated blog posting system! Your Chamkili store will now have fresh, engaging content published automatically.**
