import React from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import Input from '@material-ui/core/Input';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import FilledInput from '@material-ui/core/FilledInput';
import InputLabel from '@material-ui/core/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormGroup from '@material-ui/core/FormGroup';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
const useStyles = makeStyles(theme => ({
    root: {
        marginTop: '20px',
        marginBottom: '20px',
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
    margin: {
        margin: theme.spacing(1),
    },
    textField: {
        flexBasis: 100,
        flexGrow: 1,
    },
    inputGroup: {
        display: "flex",
        flexDirection: "row",
        flexBasis: 150,
    },
    formControl: {
        flexGrow: 3,
        margin: "5px",
    },
    outputFormControl: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    progress: {
        margin: '5px',
    },
    title: {
        margin: '8px',
        color: '#616161',
    },
}));
export default (props) => {
    const classes = useStyles();
    const {
        loading,
        outLayerName,
        outLayerNameChange,
        errors,
        onApply,
    } = props
    return (
        <div className={classes.root}>
            <div className={classes.header}>
                <Typography variant="h6" className={classes.title}>
                    3. Set Out Layer Name
                </Typography>
            </div>
            <FormControl className={classes.outputFormControl}>
                <TextField
                    error={errors && errors.outLayerName}
                    className={clsx(classes.margin, classes.textField)}
                    variant="outlined"
                    label="Output Layer Name"
                    value={outLayerName || ''}
                    onChange={outLayerNameChange}
                    InputProps={{
                        startAdornment: <InputAdornment position="start"> </InputAdornment>,
                        name: 'outLayerName',
                        placeholder: 'Output Layer Name'
                    }}
                    helperText="Please Enter an Alphanumeric Ex: table_name_1, Max length: 63 character"
                />
                <Button className={classes.applyButton} onClick={onApply} size={"large"} disabled={loading}>
                    Apply
            </Button>
            </FormControl>
        </div>
    )
}