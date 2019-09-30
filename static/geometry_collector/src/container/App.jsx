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
                layerName: undefined,
                layersAttrsErrors: undefined,
            },
            outLayersDialog: {
                open: false,
                outLayers: [],
                errors: undefined
            },
            mSelect: {
                resources: [],
                selectedResources: [],
                errors: undefined,
            },
            attributeSelector: {
                attributes: [],
            },
            outputLayerInput: {
                outLayerName: '',
                errors: undefined,
            }
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
        this.onResourceRemove = this.onResourceRemove.bind(this)
        this.getLayerAttributes = this.getLayerAttributes.bind(this)
        this.publishChange = this.publishChange.bind(this)
        this.onOutLayerCheck = this.onOutLayerCheck.bind(this)
        this.onAttrSelect = this.onAttrSelect.bind(this)
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
                layersAttrsErrors: undefined,
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
                resources: data.objects.map(r => { return { ...r, selectedResource: false } }),
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
        // Reset Attribute selector state
        if (this.state.attributeSelector.attributes.length > 0)
            this.setState({
                attributeSelector: {
                    ...this.state.attributeSelector,
                    attributes: []
                }
            })
        const selectedResources = this.state.mSelect.selectedResources
        if(selectedResources.indexOf(resource) === -1)
        this.setState({
            mSelect: {
                ...this.state.mSelect,
                selectedResources: [...selectedResources, resource],
                errors: undefined,
            }
        })
    }
    onResourceRemove(resource){
        const selectedResources = this.state.mSelect.selectedResources
        const index = selectedResources.indexOf(resource)
        selectedResources.splice(index, 1)
        this.setState({
            mSelect: {
                ...this.state.mSelect,
                selectedResources,
                errors: undefined,
            }
        })
    }
    onAttrSelect(attr) {
        const attrs = [...this.state.attributeSelector.attributes].map(
            r => {
                if (r.id === attr.id)
                    return { ...r, selected: !r.selected }
                else
                    return (r)
            }
        )
        this.setState({
            attributeSelector: {
                ...this.state.attributeSelector,
                attributes: attrs
            }
        })
    }
    async getLayerAttributes() {
        const selectedResources = this.state.mSelect.selectedResources
        const attributes = this.state.attributeSelector.attributes.length == 0
        if (selectedResources.length > 0 && attributes) {
            this.setState({
                loading: true
            })
            const layer = selectedResources[0]
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
                attributeSelector: {
                    ...this.state.attributeSelector,
                    attributes: data.objects.map(a => { return { ...a, selected: false } }),
                },
                loading: false
            });
        }
    }
    publishChange(e) {
        this.setState({
            outputLayerInput: {
                ...this.state.outputLayerInput,
                [e.target.name]: e.target.value,
                errors: undefined,
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
        let validArrayLength = arr => arr.length > 0
        let formErrors = undefined
        if (!validateTableName(form.outLayerName)) {
            formErrors = {
                ...formErrors,
                outLayerName: true
            }
        }
        if (!validArrayLength(form.resources)) {
            formErrors = {
                ...formErrors,
                selectedResources: true,
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
                        layersAttrsErrors: jsonResponse.result
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
            layers,
            attrs,
            outLayerName,
        }) => {
            let form = new FormData();
            form.append('selected_attrs', JSON.stringify(attrs))
            form.append('selected_layers', JSON.stringify(layers))
            form.append('out_layer_name', outLayerName)
            form.append('csrfmiddlewaretoken', getCRSFToken())
            fetch(this.urls.generate, {
                method: 'POST',
                body: form,
                credentials: 'same-origin',
            })
                .then(res => {
                    if(res.status == 200) handleSuccess(res)
                    if(res.status == 500) handleFailure(res)
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
        const checkAttrs = ({
            layers,
            attrs,
        }) => {
            let form = new FormData()
            form.append('selected_attrs', JSON.stringify(attrs))
            form.append('selected_layers', JSON.stringify(layers))
            form.append('csrfmiddlewaretoken', getCRSFToken())
            return fetch(this.urls.check_attributes, {
                method: 'POST',
                body: form,
                credentials: 'same-origin',
            })
        }
        const {
            outLayerName,
        } = this.state.outputLayerInput
        const layers = this.state.mSelect.selectedResources.map(r => r.name)
        const attrs = this.state.attributeSelector.attributes.filter(a => a.selected).map(a => a.attribute)
        const errors = this.validateFormData({ outLayerName, resources: layers })
        if (errors) {
            this.setState({
                outputLayerInput: {
                    ...this.state.outputLayerInput,
                    errors,
                },
                mSelect: {
                    ...this.state.mSelect,
                    errors,
                }
            })
        } else {
            this.setState({loading:true})
            checkAttrs({ layers, attrs })
                .then(
                    res => {
                        if (res.status == 200) submit({
                            layers,
                            attrs,
                            outLayerName,
                        })
                        if (res.status == 500) handleFailure(res)
                    }
                )
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
                onResourceRemove: this.onResourceRemove,
            },
            attributeSelector: {
                ...this.state.attributeSelector,
                getLayerAttributes: this.getLayerAttributes,
                onAttrSelect: this.onAttrSelect,
            },
            outputLayerInput: {
                ...this.state.outputLayerInput,
                outLayerNameChange: this.publishChange,
                onApply: this.apply,
                loading: this.state.loading
            }
        }
        return (
            <MainPage {...props} />
        )
    }
}