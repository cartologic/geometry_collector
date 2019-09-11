import React from 'react';
import { makeStyles } from '@material-ui/core'
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import ImageIcon from '@material-ui/icons/Layers';
import Exchange from '@material-ui/icons/CompareArrows';
import Typography from '@material-ui/core/Typography';
import moment from 'moment'
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
const useStyles = makeStyles(theme => ({
    root: {
        display: 'flex',
        flexDirection: 'row',
    },
    listRoot: {
        height: '300px',
        width: '100%',
        margin: '10px',
        overflow: 'overlay',
        border: '2px dashed lightgrey',
        borderRadius: '5px',
    },
    listRootError: {
        height: '300px',
        width: '100%',
        margin: '10px',
        overflow: 'overlay',
        border: '2px dashed red',
        borderRadius: '5px',
    },
    exchange: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    exchangeIcon: {
        fontSize: '2.5rem',
        color: 'grey',
    },
    title: {
        color: 'grey',
        marginLeft: '15px',
    }
}));
const SelectComponent = (props) => {
    const {
        resources,
        onResourceSelect,
        errors,
    } = props
    console.log({errors})
    const classes = useStyles()
    return (
        <div className={classes.root}>
            <List className={classes.listRoot}>
                {
                    resources.map((resource) => {
                        if (!resource.selectedResource)
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
            <div className={classes.exchange}>
                <Exchange className={classes.exchangeIcon} />
            </div>
            <List className={(errors && errors.selectedResources) ? classes.listRootError : classes.listRoot}>
                {
                    resources.map((resource) => {
                        if (resource.selectedResource)
                            return (
                                <ListItem button key={resource.id} onClick={() => { onResourceSelect(resource) }}>
                                    <FormControlLabel control={<Checkbox checked={true} color={'primary'} />} />
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
        </div>
    )
}

export default (props) => {
    const {
        resources,
        onResourceSelect,
        errors,
    } = props
    const classes = useStyles()
    return (
        <div>
            <Typography variant="h6" className={classes.title}>
                1. Select Layers
            </Typography>
            <SelectComponent
                resources={resources}
                onResourceSelect={onResourceSelect} 
                errors={errors} />
        </div>
    )
}