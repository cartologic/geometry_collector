import React from 'react';
import { makeStyles } from '@material-ui/core'
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import DownloadIcon from '@material-ui/icons/GetApp';
import Exchange from '@material-ui/icons/CompareArrows';
import Typography from '@material-ui/core/Typography';
import moment from 'moment'
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Button from '@material-ui/core/Button';
const useStyles = makeStyles(theme => ({
    root: {
        marginTop: '20px',
    },
    header: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
    title: {
        flexGrow: 1,
        color: 'grey',
        marginLeft: '15px',
    },
    downloadIcon: {
        marginLeft: '10px',
    },
    rootAttr: {
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
    typoArea: {
        height: '300px',
        width: '100%',
        margin: '10px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    }
}));

const SelectComponent = (props) => {
    const {
        attrs,
        onAttrSelect,
    } = props
    const classes = useStyles()
    return (
        <div className={classes.rootAttr}>
            <List className={classes.listRoot}>
                {
                    attrs.map((attr) => {
                        return (
                            <ListItem button key={attr.id}>
                                <FormControlLabel control={<Checkbox onChange={()=>{onAttrSelect(attr)}} color={'primary'} />} />
                                <ListItemText primary={attr.attribute}/>
                            </ListItem>
                        )
                    })
                }
            </List>
            <div className={classes.typoArea}>
                <Typography variant="subtitle1" gutterBottom>
                    TIP: Select no attribute to collect geometries only from the selected layers
                </Typography>
            </div>
        </div>
    )
}

export default (props) => {
    const {
        getLayerAttributes,
        attributes,
        onAttrSelect,
    } = props
    const classes = useStyles()
    return (
        <div className={classes.root}>
            <div className={classes.header}>
                <Typography variant="h6" className={classes.title}>
                    2. Select Attributes
                </Typography>
                <Button color="primary" onClick={getLayerAttributes} variant="contained" color="default">
                    Get Attributes
                    <DownloadIcon className={classes.downloadIcon} />
                </Button>
            </div>
            <SelectComponent attrs={attributes} onAttrSelect={onAttrSelect}/>
        </div>
    )
}