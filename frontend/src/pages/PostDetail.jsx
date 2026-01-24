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