import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  CardHeader,
  Typography,
  Button,
  IconButton,
  Box,
  TextField,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  Comment,
  Share,
  MoreVert,
  Add,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { getPosts, likePost } from '../store/slices/postSlice';
import { formatDistanceToNow } from 'date-fns';