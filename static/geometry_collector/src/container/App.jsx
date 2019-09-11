import React, { Component } from 'react'
import MainPage from '../components/MainPage'
import { getCRSFToken, groupByFilter } from '../utils'
import UrlAssembler from 'url-assembler'
const sortByFilter = groupByFilter
export default class App extends Component {
    constructor(props) {
        super(props)
        this.state = {
            loading: false,
            resourceSelectDialog: {
                open: false,
                resources: [],
            },
            publishForm: {
                selectedResource: undefined,
                attributes: [],
                sortByValue: '',
                groupByValue: '',
                outLayerName: '',
                errors: {},
            },
            resultsDialog: {
                open: false,
                errors: undefined,
                success: undefined,
                layerName: undefined
            },
            outLayersDialog: {
                open: false,
                outLayers: [],
                errors: undefined
            },
            mSelect: {
                resources: [],
            },
        }
        // globalURLS are predefined in index.html otherwise use the following defaults
        this.urls = globalURLS
        this.checkedLineFeatures = []
        this.fetchResources = this.fetchResources.bind(this)
        this.resourceSelectDialogClose = this.resourceSelectDialogClose.bind(this)
        this.resourceSelectDialogOpen = this.resourceSelectDialogOpen.bind(this)
        this.resultsDialogClose = this.resultsDialogClose.bind(this)
        this.outLayersDialogClose = this.outLayersDialogClose.bind(this)
        this.resultsDialogOpen = this.resultsDialogOpen.bind(this)
        this.onResourceSelect = this.onResourceSelect.bind(this)
        this.getLayerAttributes = this.getLayerAttributes.bind(this)
        this.publishChange = this.publishChange.bind(this)
        this.onOutLayerCheck = this.onOutLayerCheck.bind(this)
        this.apply = this.apply.bind(this)
    }
    resourceSelectDialogClose() {
        this.setState({
            resourceSelectDialog: {
                ...this.state.resourceSelectDialog,
                open: false
            }
        })
    }
    resourceSelectDialogOpen() {
        this.setState({
            resourceSelectDialog: {
                ...this.state.resourceSelectDialog,
                open: true
            }
        })
    }
    resultsDialogClose() {
        this.setState({
            resultsDialog: {
                ...this.state.resultsDialog,
                open: false
            }
        })
    }
    resultsDialogOpen() {
        this.setState({
            resultsDialog: {
                ...this.state.resultsDialog,
                open: true
            }
        })
    }
    outLayersDialogClose() {
        this.setState({
            outLayersDialog: {
                ...this.state.outLayersDialog,
                open: false
            }
        })
    }
    async fetchResources() {
        const params = {
            'geom_type': 'point',
        }
        const url = UrlAssembler(this.urls.layersAPI).query(params).toString()
        const response = await fetch(url, {
            method: 'GET',
            credentials: 'include',
            headers: {
                "X-CSRFToken": getCRSFToken(),
            }
        });
        const data = await response.json();
        this.setState({
            loading: false,
            mSelect: {
                ...this.state.mSelect,
                resources: data.objects.map(r=>{return {...r, selectedResource:false}}),
            }
        });
    }
    componentDidMount() {
        this.setState(
            {
                loading: true
            },
            () => {
                this.fetchResources()
            }
        )
    }
    onResourceSelect(resource) {
        const resources = [...this.state.mSelect.resources].map(
            r => {
                if(r.id === resource.id)
                    return {...r, selectedResource:!r.selectedResource}
                else 
                    return(r)
            }
        )
        this.setState({
            mSelect:{
                ...this.state.mSelect,
                resources
            }
        })
    }
    async getLayerAttributes() {
        const layer = this.state.publishForm.selectedResource
        const params = {
            'layer__id': layer.id
        }
        const url = UrlAssembler(this.urls.attributesAPI).query(params).toString()
        const response = await fetch(url, {
            method: 'GET',
            credentials: 'include',
            headers: {
                "X-CSRFToken": getCRSFToken(),
            }
        });
        const data = await response.json();
        this.setState({
            publishForm: {
                ...this.state.publishForm,
                attributes: data.objects,
            },
            loading: false
        });
    }
    publishChange(e) {
        if (e.target.name === "groupByValue" && e.target.value !== this.state.publishForm["groupByValue"]) {
            this.checkedLineFeatures = []
        }
        this.setState({
            publishForm: {
                ...this.state.publishForm,
                [e.target.name]: e.target.value,
            }
        })
    }
    validateFormData(form) {
        let emptyOrUndefined = (str) => {
            return str && str.length > 0
        }
        let validateTableName = (tableName) => {
            let re = /^[a-z0-9_]{1,63}$/
            return tableName && re.test(tableName)
        }
        let formErrors = undefined
        if (!emptyOrUndefined(form.inLayerName)) {
            formErrors = {
                ...formErrors,
                inLayerName: true
            }
        }
        if (!validateTableName(form.outLayerName)) {
            formErrors = {
                ...formErrors,
                outLayerName: true
            }
        }
        return formErrors
    }
    apply() {
        const handleFailure = (res) => {
            res.json().then(jsonResponse => {
                this.setState({
                    loading: false,
                    resultsDialog: {
                        ...this.state.resultsDialog,
                        open: true,
                        errors: jsonResponse.message,
                        success: undefined,
                    }
                })
            })
        }
        const handleSuccess = (res) => {
            res.json().then(jsonResponse => {
                this.setState({
                    loading: false,
                    resultsDialog: {
                        ...this.state.resultsDialog,
                        open: true,
                        errors: undefined,
                        success: jsonResponse.message,
                        layerURL: this.urls.layerDetail(jsonResponse.layer_name),
                    }
                })
            })
        }
        const lineLayersSuccess = (res) => {
            res.json().then(jsonResponse => {
                this.setState({
                    loading: false,
                    outLayersDialog: {
                        ...this.state.outLayersDialog,
                        open: true,
                        errors: undefined,
                        success: jsonResponse.message,
                        outLayers: jsonResponse.objects
                    }
                })
            })
        }
        const lineLayersFailure = (res) => {
            res.json().then(jsonResponse => {
                this.setState({
                    loading: false,
                    outLayersDialog: {
                        ...this.state.outLayersDialog,
                        open: true,
                        errors: jsonResponse.message,
                        success: undefined,
                    }
                })
            })
        }
        const submit = ({
            inLayerName,
            outLayerName,
            sortByValue,
            groupByValue,
            checkedLineFeatures
        }) => {
            let form = new FormData();
            form.append('in_layer_name', inLayerName)
            if (sortByValue && sortByValue.length > 0)
                form.append('sort_by_attr', sortByValue)
            if (groupByValue && groupByValue.length > 0)
                form.append('group_by_attr', groupByValue)
            if (checkedLineFeatures && checkedLineFeatures.length > 0)
                form.append('line_features', JSON.stringify(checkedLineFeatures))
            form.append('out_layer_name', outLayerName)
            form.append('csrfmiddlewaretoken', getCRSFToken())
            fetch(this.urls.generateLineLayer, {
                method: 'POST',
                body: form,
                credentials: 'same-origin',
            })
                .then(res => {
                    if (res.status == 500) {
                        handleFailure(res)
                    }
                    if (res.status == 200) {
                        handleSuccess(res)
                    }
                })
        }
        const getLineFeatures = ({
            inLayerName,
            outLayerName,
            sortByValue,
            groupByValue
        }) => {
            let form = new FormData();
            form.append('in_layer_name', inLayerName)
            if (sortByValue && sortByValue.length > 0)
                form.append('sort_by_attr', sortByValue)
            if (groupByValue && groupByValue.length > 0)
                form.append('group_by_attr', groupByValue)
            form.append('out_layer_name', outLayerName)
            form.append('csrfmiddlewaretoken', getCRSFToken())
            fetch(this.urls.getLineFeatures, {
                method: 'POST',
                body: form,
                credentials: 'same-origin',
            })
                .then(res => {
                    if (res.status == 500) {
                        lineLayersFailure(res)
                    }
                    if (res.status == 200) {
                        lineLayersSuccess(res)
                    }
                })
        }
        const {
            selectedResource,
            sortByValue,
            groupByValue,
            outLayerName,
        } = this.state.publishForm
        const checkedLineFeatures = this.checkedLineFeatures
        const inLayerName = selectedResource && selectedResource.name
        const errors = this.validateFormData({
            inLayerName,
            outLayerName,
            sortByValue,
            groupByValue
        })
        if (errors) {
            this.setState({
                publishForm: {
                    ...this.state.publishForm,
                    errors,
                }
            })
        } else {
            if (groupByValue.length == 0) {
                // get single line feature from all points in the selected point layer
                // submit without checkedLineFeatures
                this.setState({
                    publishForm: {
                        ...this.state.publishForm,
                        errors: {},
                    },
                    loading: true
                },
                    () => {
                        submit({
                            inLayerName,
                            outLayerName,
                            sortByValue,
                            groupByValue
                        })
                    }
                )
            }

            if (groupByValue.length > 0 && checkedLineFeatures.length == 0) {
                this.setState({
                    publishForm: {
                        ...this.state.publishForm,
                        errors: {},
                    },
                    loading: true
                },
                    () => {
                        getLineFeatures({
                            inLayerName,
                            outLayerName,
                            sortByValue,
                            groupByValue
                        })
                    }
                )
            }
            if (groupByValue.length > 0 && checkedLineFeatures.length > 0) {
                // submit with list of selected line features
                this.setState({
                    publishForm: {
                        ...this.state.publishForm,
                        errors: {},
                    },
                    loading: true
                },
                    () => {
                        submit({
                            inLayerName,
                            outLayerName,
                            sortByValue,
                            groupByValue,
                            checkedLineFeatures
                        })
                    }
                )
            }
        }
    }
    onOutLayerCheck(e) {
        let lineNames = [...this.checkedLineFeatures]
        if (e.target.checked) {
            lineNames = [...lineNames, e.target.value]
        } else {
            lineNames.splice(lineNames.indexOf(e.target.value), 1)
        }
        this.checkedLineFeatures = [...lineNames]
    }
    render() {
        const props = {
            urls: this.urls,
            loading: this.state.loading,
            resourceSelectProps: {
                ...this.state.resourceSelectDialog,
                handleClose: this.resourceSelectDialogClose,
                onResourceSelect: this.onResourceSelect,
                selectedResource: this.state.publishForm.selectedResource,
                loading: this.state.loading,
            },
            publishForm: {
                ...this.state.publishForm,
                resourceSelectDialogOpen: this.resourceSelectDialogOpen,
                sortByChange: this.publishChange,
                sortByFilter,
                groupByChange: this.publishChange,
                groupByFilter,
                outLayerNameChange: this.publishChange,
                onApply: this.apply,
                loading: this.state.loading
            },
            resultsDialog: {
                ...this.state.resultsDialog,
                handleClose: this.resultsDialogClose,
            },
            outLayersDialog: {
                ...this.state.outLayersDialog,
                inLayer: this.state.publishForm.selectedResource,
                groupByValue: this.state.publishForm.groupByValue,
                handleClose: this.outLayersDialogClose,
                onCheck: this.onOutLayerCheck
            },
            mSelect: {
                ...this.state.mSelect,
                onResourceSelect: this.onResourceSelect,
            },
        }
        return (
            <MainPage {...props} />
        )
    }
}