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
import ImageIcon from '@material-ui/icons/Layers';
import TextField from '@material-ui/core/TextField';
import moment from 'moment'
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles(theme => ({
}))
export default (props) => {
  const {
    open,
    handleClose,
    errors,
    warnings,
    success,
    layerURL,
  } = props
  const classes = useStyles()
  return (
    <div>
      <Dialog
        open={open}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        fullWidth={false}
        maxWidth={'sm'}
      >
        <DialogTitle>Results:</DialogTitle>
        <DialogContent dividers>
          {
            errors &&
            <Typography gutterBottom color={'error'}>
              {errors}
            </Typography>
          }
          {
            success &&
            <Typography gutterBottom>
              {success}
            </Typography>
          }
        </DialogContent>
        <DialogActions>
          {
            success &&
            <Link underline={'none'} color="inherit" href={layerURL}>
              <Button color="inherit">View Layer</Button>
            </Link>
          }
          <Button onClick={handleClose} color="primary">
            Dismiss
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}
