require('dotenv').config(); //Load .env file
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('Connection Error:', err));

app.get('/', (req, res) => {
  res.send('Samyati Backend');
});

// Import routes
const userRoutes = require('./routes/UserRoutes');
const blogRoutes = require('./routes/blogRoutes');

// Use Routes
app.use('/api/users', userRoutes);
app.use('/api/blogs', blogRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));