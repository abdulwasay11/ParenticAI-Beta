import React, { useState, ReactNode } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  useTheme,
  useMediaQuery,
  IconButton,
} from '@mui/material';
import {
  Dashboard,
  Person,
  ChildCare,
  Chat,
  People,
  Psychology,
  History,
  Menu as MenuIcon,
  Logout,
  Settings,
  Brightness4,
  Brightness7,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useThemeMode } from '../../contexts/ThemeContext';

// TypeScript interfaces
interface LayoutProps {
  children: ReactNode;
}

interface MenuItem {
  text: string;
  icon: React.ReactElement;
  path: string;
}

const drawerWidth = 240;

const menuItems: MenuItem[] = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
  { text: 'Profile', icon: <Person />, path: '/profile' },
  { text: 'Children', icon: <ChildCare />, path: '/children' },
  { text: 'AI Chat', icon: <Chat />, path: '/chat' },
  { text: 'Community', icon: <People />, path: '/community' },
  { text: 'Personality Assessment', icon: <Psychology />, path: '/personality-assessment' },
  { text: 'Chat History', icon: <History />, path: '/chat-history' },
];

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const { mode, toggleMode } = useThemeMode();

  const handleDrawerToggle = (): void => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path: string): void => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const drawer = (
    <Box>
      <Toolbar>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 700,
            background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          ParenticAI
        </Typography>
      </Toolbar>
      <List>
        {menuItems.map((item: MenuItem) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
              sx={{
                borderRadius: 2,
                mx: 1,
                mb: 0.5,
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                },
                '&:hover': {
                  backgroundColor: 'primary.light',
                  color: 'white',
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          backgroundColor: 'background.paper',
          color: 'text.primary',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Welcome to ParenticAI!
          </Typography>
          <IconButton
            color="inherit"
            onClick={toggleMode}
            sx={{ mr: 1 }}
            aria-label="toggle dark mode"
          >
            {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
          <IconButton
            color="inherit"
            onClick={() => navigate('/account-settings')}
            sx={{ mr: 1 }}
            aria-label="account settings"
          >
            <Settings />
          </IconButton>
          <Button
            startIcon={<Logout />}
            onClick={logout}
            variant="outlined"
            size="small"
            sx={{ borderRadius: 2 }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          backgroundColor: 'background.default',
        }}
      >
        <Toolbar />
        <Container maxWidth="xl" sx={{ py: 3 }}>
          {children}
        </Container>
      </Box>
    </Box>
  );
};

export default Layout; 