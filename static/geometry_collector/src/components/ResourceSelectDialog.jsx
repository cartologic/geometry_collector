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

const useStyles = makeStyles(theme => ({
  dialogHeader: {
    display: 'flex',
  },
  dialogTitle: {
    flexGrow: 1,
    minWidth:  '600px',
    display: 'flex',
    flexDirection: 'row',
  },
  searchInput: {
    width: "100%",
  },
  searchArea: {
    display: "flex",
    flexDirection: 'Column',
  },
  selectedItem: {
    border: '2px solid darkgrey',
    borderRadius: '5px'
  },
  progress:{
    marginLeft: '50px',
  }
}))
export default (props) => {
  const {
    open,
    handleClose,
    resources,
    onResourceSelect,
    selectedResource,
    loading,
  } = props
  const classes = useStyles()
  return (
    <div>
      <Dialog
        open={open}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        fullWidth={false}
        maxWidth={'md'}
        onClose={handleClose}
      >
        <DialogTitle className={classes.dialogTitle}>
          Select Point Layer
          {
            loading &&
            <CircularProgress className={classes.progress} size={15} />
          }
        </DialogTitle>
        <DialogContent>
          <div className={classes.searchArea}>
            {
              false &&
              <TextField
                id="outlined-bare"
                className={classes.searchInput}
                margin="normal"
                variant="outlined"
                inputProps={{ 'aria-label': 'bare' }}
                placeholder="Search Layers"
              />
            }
            {
              selectedResource &&
              <ListItem key={selectedResource.id} className={classes.selectedItem}>
                <ListItemText primary={'Selected Layer:'} />
                <ListItemAvatar>
                  <Avatar>
                    <ImageIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary={selectedResource.title} secondary={moment(new Date(selectedResource.date)).format('MMMM Do YYYY, h:mm:ss a')} />
              </ListItem>
            }
          </div>
          <List className={classes.root}>
            {
              resources.map((resource) => {
                return (
                  <ListItem button key={resource.id} onClick={() => { onResourceSelect(resource) }}>
                    <ListItemAvatar>
                      <Avatar>
                        <ImageIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={resource.title} secondary={moment(new Date(resource.date)).format('MMMM Do YYYY, h:mm:ss a')} />
                  </ListItem>
                )
              })
            }
          </List>
        </DialogContent>
      </Dialog>
    </div>
  )
}
