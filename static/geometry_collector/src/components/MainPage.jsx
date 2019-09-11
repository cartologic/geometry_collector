import React, { Component } from 'react'
import AppBar from '../components/AppBar'
import ContentWrapper from '../components/ContentWrapper'
import { makeStyles } from '@material-ui/core/styles';
const useStyles = makeStyles(theme => ({
    root: {
      minHeight: '100vh',
      paddingBottom: '50px',
      backgroundColor: '#e5e5e5',
    },
  }));
export default (props) => {
    const classes = useStyles();
    return <div className={classes.root}>
        <AppBar {...props} />
        <ContentWrapper {...props} />
    </div>
}