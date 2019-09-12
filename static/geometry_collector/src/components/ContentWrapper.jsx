import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import PublishForm from './PublishForm'
import ResourceSelectDialog from './ResourceSelectDialog'
import ResultsDialog from './ResultsDialog'
import OutLayersDialog from './OutLayersDialog'
import RS from "./MResourceSelect";
import AS from "./AttributesSelector";
import OLI from "./OutLayerInput";
import CssBaseline from '@material-ui/core/CssBaseline';
import Container from '@material-ui/core/Container';
import LinearProgress from '@material-ui/core/LinearProgress';
const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(1, 1),
    marginTop: '50px',
    position: 'relative'
  },
  progress: {
    width: '100%',
    position: 'absolute',
    left: '0px',
    top: '0px',
  }
}));
export default (props) => {
  const classes = useStyles();
  const {
    loading,
    mSelect,
    attributeSelector,
    outputLayerInput,
    resultsDialog,
  } = props
  return (
    <div>
      <CssBaseline />
      <Container maxWidth="md">
        <Paper className={classes.root}>
          {
            loading &&
            <LinearProgress className={classes.progress}/>
          }
          <RS {...mSelect}/>
          <AS {...attributeSelector}/>
          <OLI {...outputLayerInput}/>
          <ResultsDialog {...resultsDialog}/>
        </Paper>
      </Container>
    </div>
  );
}
