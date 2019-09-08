import React, { Component } from 'react'
import AppBar from '../components/AppBar'
import ContentWrapper from '../components/ContentWrapper'
import { makeStyles } from '@material-ui/core/styles';
const useStyles = makeStyles(theme => ({
    root: {
      height: '100vh',
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