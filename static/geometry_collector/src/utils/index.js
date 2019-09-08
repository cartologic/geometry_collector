export const getCRSFToken = () => {
    let csrfToken, csrfMatch = document.cookie.match( /csrftoken=(\w+)/ )
    if ( csrfMatch && csrfMatch.length > 0 ) {
        csrfToken = csrfMatch[ 1 ]
    }
    return csrfToken
};
const numericTypes = [
    'xsd:byte',
    'xsd:decimal',
    'xsd:double',
    'xsd:int',
    'xsd:integer',
    'xsd:long',
    'xsd:negativeInteger',
    'xsd:nonNegativeInteger',
    'xsd:nonPositiveInteger',
    'xsd:positiveInteger',
    'xsd:short',
    'xsd:unsignedLong',
    'xsd:unsignedInt',
    'xsd:unsignedShort',
    'xsd:unsignedByte'
]
const stringTypes = ['xsd:string']
const stringNumericTypes = [...stringTypes, ...numericTypes]
export const sortByFilter = attribute => numericTypes.indexOf(attribute.attribute_type) !== -1
export const groupByFilter = attribute => stringNumericTypes.indexOf(attribute.attribute_type) !== -1