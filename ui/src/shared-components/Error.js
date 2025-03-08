import React from 'react'
import { useRouteError } from 'react-router-dom'
import { Container, Typography, useMediaQuery, useTheme } from '@mui/material'

const Error = ({ error }) => {
  const theme = useTheme()
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'))

  const err = useRouteError()
  if (!error) {
    error = err
  }
  console.log(error)
  return (
    <Container maxWidth={isSmallScreen ? 'sm' : 'md'}>
      <Typography variant={isSmallScreen ? 'h3' : 'h1'}>Oops!!!</Typography>
      <Typography variant={isSmallScreen ? 'h4' : 'h2'}>
        Something went wrong
      </Typography>
      <Typography variant={isSmallScreen ? 'h5' : 'h4'} color='error'>
        {error !== null
          ? `${error?.status !== undefined ? error?.status + ': ' : ''} ${
              error?.statusText !== undefined ? error?.statusText : ''
            }`
          : ''}
        {error !== null
          ? `${error?.message !== undefined ? error?.message : ''}`
          : ''}
      </Typography>
    </Container>
  )
}
export default Error