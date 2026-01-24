import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Avatar,
  IconButton,
  TextField,
  Button,
  Divider,
  Chip,
} from '@mui/material';
import { Favorite, FavoriteBorder, Comment, Share, ArrowBack } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const PostDetailPage = () => {
  const { id } = useParams();
  const [comment, setComment] = useState('');
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(42);
  
  const post = {
    id: id,
    title: 'Best Practices for Organic Tomato Farming',
    content: `Organic tomato farming requires careful attention to soil health, pest management, and irrigation. Here are some key practices:

1. Soil Preparation: Use compost and organic matter to enrich the soil
2. Pest Control: Introduce beneficial insects and use neem oil sprays
3. Watering: Drip irrigation is most efficient for tomatoes
4. Harvesting: Pick tomatoes when they are fully colored but still firm

Remember, healthy soil means healthy plants!`,
    author: {
      name: 'Dr. Jane Farmer',
      role: 'Organic Farming Expert',
      avatar: '',
    },
    createdAt: new Date('2024-01-10'),
    tags: ['organic', 'tomatoes', 'farming', 'agriculture'],
    comments: [
      { id: 1, user: 'John Doe', text: 'Great advice! When is the best time to plant?', time: '2 hours ago' },
      { id: 2, user: 'Maria Green', text: 'Have you tried companion planting with basil?', time: '1 day ago' },
    ],
  };