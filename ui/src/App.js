import React, { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Navigate
} from 'react-router-dom'
import { Box, Divider, Typography, CircularProgress } from '@mui/material'
import SignUp from './sign-up/SignUp.js'
import SignIn from './sign-in/SignIn.js'
import SignInSide from './sign-in-side/SignInSide.js'
import Error from './shared-components/Error'
import { AuthProvider, useAuth } from './services/contexts/AuthContext'
import Dashboard from './shared-components/Dashboard'

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { authenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (!authenticated) {
    return <Navigate to="/signin" />;
  }
  
  return children;
};

// Public route - redirects to dashboard if already authenticated
const PublicRoute = ({ children }) => {
  const { authenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (authenticated) {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};
const Root = () => {
  return (
    <Box
      sx={{
        flex: 1,
      }}
    >
      {/* <Box
        sx={{
          flexGrow: 1,
          display: { xs: 'none', md: 'flex' },
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Link
          to={'/signup'}
          style={{
            textDecoration: 'none',
            cursor: 'pointer',
            color: 'white',
          }}
        >
          <Typography
            // variant="h6"
            component='div'
            sx={{
              // flexGrow: 1,
              color: '#FFF',
              bgcolor: '#000',
              ml: 2,
              mr: 2,
              '&:hover': {
                color: '#ffcf51',
              },
              fontSize: '1rem',
            }}
          >
            {'Sign Up'}
          </Typography>
        </Link>
        <Divider
          style={{ background: 'white', width: 1, borderRadius: 2 }}
          orientation='vertical'
          variant='middle'
          flexItem
          //  sx={{ height: 40 }}
        />
        <Link
          to={'/signin'}
          style={{
            textDecoration: 'none',
            cursor: 'pointer',
            color: 'white',
          }}
        >
          <Typography
            // variant="h6"
            component='div'
            sx={{
              // flexGrow: 1,
              color: '#FFF',
              bgcolor: '#000',
              ml: 2,
              mr: 2,
              '&:hover': {
                color: '#ffcf51',
              },
              fontSize: '1rem',
            }}
          >
            {'Sign In'}
          </Typography>
        </Link>
        <Divider
          style={{ background: 'white', width: 1, borderRadius: 2 }}
          orientation='vertical'
          variant='middle'
          flexItem
          //  sx={{ height: 40 }}
        />
        <Link
          to={'/signin2'}
          style={{
            textDecoration: 'none',
            cursor: 'pointer',
            color: 'white',
          }}
        >
          <Typography
            // variant="h6"
            component='div'
            sx={{
              // flexGrow: 1,
              color: '#FFF',
              bgcolor: '#000',
              ml: 2,
              mr: 2,
              '&:hover': {
                color: '#ffcf51',
              },
              fontSize: '1rem',
            }}
          >
            {'Sign In with content'}
          </Typography>
        </Link>
      </Box> */}
      <Outlet />
    </Box>
  )
}
const createAppRouter = () =>
  createBrowserRouter([
    {
      path: '/',
      element: <Root />,
      errorElement: <Error />,
      children: [
        {
          path: '/',
          element: <Navigate to='/dashboard' replace />,
        },
        {
          path: '/signup',
          element: (
            <PublicRoute>
              <SignUp />
            </PublicRoute>
          ),
        },
        {
          path: '/signin',
          element: (
            <PublicRoute>
              <SignIn />
            </PublicRoute>
          ),
        },
        {
          path: '/signin2',
          element: (
            <PublicRoute>
              <SignInSide />
            </PublicRoute>
          ),
        },
        {
          path: '/dashboard',
          element: (
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          ),
        },
      ],
    },
  ])
const App = () => {
   const router = createAppRouter()
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}

export default App;
