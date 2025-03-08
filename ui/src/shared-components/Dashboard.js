import React, { useState } from 'react'
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Paper,
  Avatar,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  TextField,
  IconButton,
  Menu,
  MenuItem,
  Alert,
  Snackbar,
} from '@mui/material'
import { useAuth } from '../services/contexts/AuthContext'
import { styled } from '@mui/material/styles'
import {
  AccountCircle,
  Settings,
  ExitToApp,
  Save,
  Person,
} from '@mui/icons-material'
import { updateUserProfile } from '../services/auth-service'

const StyledContent = styled(Box)(({ theme }) => ({
  backgroundColor:
    theme.palette.mode === 'light'
      ? '#f5f5f5'
      : theme.palette.background.default,
  minHeight: 'calc(100vh - 64px)',
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
}))

const Dashboard = () => {
  const { user, userProfile, logout } = useAuth()
  const [anchorEl, setAnchorEl] = useState(null)
  const [editing, setEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    bio: userProfile?.profileData?.bio || '',
    location: userProfile?.profileData?.location || '',
    phone: userProfile?.profileData?.phone || '',
    website: userProfile?.profileData?.website || '',
  })
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success',
  })

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = async () => {
    handleClose()
    await logout()
  }

  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSaveProfile = async () => {
    try {
      const updatedProfile = {
        userId: userProfile?.userId,
        profileData: {
          ...userProfile?.profileData,
          ...profileData,
        },
        settings: userProfile?.settings || {},
      }

      await updateUserProfile(updatedProfile)
      setEditing(false)
      setNotification({
        open: true,
        message: 'Profile updated successfully!',
        severity: 'success',
      })
    } catch (error) {
      console.error('Failed to update profile:', error)
      setNotification({
        open: true,
        message: 'Failed to update profile. Please try again.',
        severity: 'error',
      })
    }
  }

  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false,
    })
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position='static'>
        <Toolbar>
          <Typography variant='h6' component='div' sx={{ flexGrow: 1 }}>
            Dashboard
          </Typography>
          <IconButton
            size='large'
            aria-label='account of current user'
            aria-controls='menu-appbar'
            aria-haspopup='true'
            onClick={handleMenu}
            color='inherit'
          >
            <AccountCircle />
          </IconButton>
          <Menu
            id='menu-appbar'
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={handleClose}>
              <Person fontSize='small' sx={{ mr: 1 }} /> My Account
            </MenuItem>
            <MenuItem onClick={handleClose}>
              <Settings fontSize='small' sx={{ mr: 1 }} /> Settings
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ExitToApp fontSize='small' sx={{ mr: 1 }} /> Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <StyledContent>
        <Container maxWidth='lg'>
          <Grid container spacing={3}>
            {/* Welcome Card */}
            <Grid item xs={12}>
              <Paper
                sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}
              >
                <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}>
                  {user?.name?.charAt(0) || 'U'}
                </Avatar>
                <Box>
                  <Typography variant='h5'>Welcome, {user?.name}!</Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {user?.email}
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            {/* Profile Card */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader
                  title='Profile Information'
                  action={
                    editing ? (
                      <Button
                        startIcon={<Save />}
                        variant='contained'
                        onClick={handleSaveProfile}
                      >
                        Save
                      </Button>
                    ) : (
                      <Button onClick={() => setEditing(true)}>Edit</Button>
                    )
                  }
                />
                <Divider />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        label='Bio'
                        name='bio'
                        value={profileData.bio}
                        onChange={handleProfileChange}
                        fullWidth
                        multiline
                        rows={3}
                        disabled={!editing}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label='Location'
                        name='location'
                        value={profileData.location}
                        onChange={handleProfileChange}
                        fullWidth
                        disabled={!editing}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label='Phone Number'
                        name='phone'
                        value={profileData.phone}
                        onChange={handleProfileChange}
                        fullWidth
                        disabled={!editing}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label='Website'
                        name='website'
                        value={profileData.website}
                        onChange={handleProfileChange}
                        fullWidth
                        disabled={!editing}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Settings Card */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardHeader title='Account Settings' />
                <Divider />
                <CardContent>
                  <Typography variant='body2' color='text.secondary' paragraph>
                    Your account is managed through Keycloak.
                  </Typography>
                  <Button
                    variant='outlined'
                    color='primary'
                    startIcon={<Settings />}
                  >
                    Manage Account Settings
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </StyledContent>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          variant='filled'
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default Dashboard
