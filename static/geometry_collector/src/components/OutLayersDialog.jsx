import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormHelperText from '@material-ui/core/FormHelperText';
import CircularProgress from '@material-ui/core/CircularProgress';
import CloseIcon from '@material-ui/icons/Close'
import { makeStyles } from '@material-ui/core/styles';
import Link from '@material-ui/core/Link';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import LayerIcon from '@material-ui/icons/Layers';
import Adjust from '@material-ui/icons/Adjust';
import TextField from '@material-ui/core/TextField';
import moment from 'moment'
import Typography from '@material-ui/core/Typography';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';

const useStyles = makeStyles(theme => ({
  dialogTitle: {
    minWidth: "600px",
  },
  selectedLayerArea :{
    minHeight : 'max-content',
  },
  selectItem: {
    display: "flex",
    flexDirection: 'row',
    margin: '15px 0',
    alignItems: 'center',
  },
  layerDetails: {
    display: 'flex',
    flexDirection: 'column',
    margin: '5px 20px'
  },
  selectedLayer: {
    border: "1px solid lightgrey",
    borderRadius: '5px',
    padding: '5px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: "center",
    marginBottom: '10px',
    padding: "5px 10px",
  }
}))
const ErrorDialog = (props) => {
  const classes = useStyles()
  const {
    errors,
    open,
    handleClose
  } = props
  return (
    <Dialog
      open={open}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      fullWidth={false}
      maxWidth={'md'}
    >
      <DialogTitle className={classes.dialogTitle}>Select Sub Lines</DialogTitle>
      <DialogContent dividers>
        <Typography gutterBottom color={'error'}>
          {errors}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Dismiss
          </Button>
      </DialogActions>
    </Dialog>
  )
}
const LayersSelectComponent = (props) => {
  const classes = useStyles()
  const { outLayers, onChange, groupByValue } = props
  return (
    outLayers.map((layer, index) => (
      <div key={index} className={classes.selectItem}>
        <FormControlLabel
          control={
            <Checkbox onChange={onChange} value={layer.name} />
          }
        />

          <Adjust />


        <div className={classes.layerDetails}>
          <Typography>
            {groupByValue}: {layer.name}
          </Typography>
          <Typography variant={'subtitle2'} color={'textSecondary'}>
            Point features count: {layer.numberOfFeatures}
          </Typography>
        </div>
      </div>
    ))
  )
}
export default (props) => {
  const {
    open,
    handleClose,
    outLayers,
    onCheck,
    inLayer,
    layerURL,
    groupByValue,
    errors,
  } = props
  const classes = useStyles()
  return (
    <div>
      {
        errors &&
        <ErrorDialog
          errors={errors}
          open={open}
          handleClose={handleClose}
        />
      }
      {
        !errors &&

        <Dialog
          open={open}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          fullWidth={false}
          maxWidth={'md'}
          onClose={handleClose}
        >
          <DialogTitle className={classes.dialogTitle}>Select Sub Lines</DialogTitle>
          <DialogContent className={classes.selectedLayerArea}>
            <div className={classes.selectedLayer}>
              <Avatar>
                <LayerIcon />
              </Avatar>
              <Typography className={classes.layerDetails}>
                Selected Point Layer: <strong>{inLayer && inLayer.name}</strong>
              </Typography>
            </div>
          </DialogContent>
          <DialogContent dividers>
            <LayersSelectComponent
              onChange={onCheck}
              outLayers={outLayers}
              groupByValue={groupByValue}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary">
              OK
          </Button>
          </DialogActions>
        </Dialog>
      }
    </div>
  )
}
