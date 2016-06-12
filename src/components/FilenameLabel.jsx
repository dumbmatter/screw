const classNames = require('classnames');
const React = require('react');

const FilenameLabel = props => {
    if (props.filename === undefined) {
        return null;
    }

    const classes = ['alert', 'filename-label'];
    if (props.error === undefined) {
        classes.push('alert-info');
    } else {
        classes.push('alert-danger');
    }

    return <span className={classNames(classes)}>{props.filename}</span>;
};

FilenameLabel.propTypes = {
    error: React.PropTypes.shape({
        type: React.PropTypes.string.isRequired,
        message: React.PropTypes.string.isRequired,
    }),
    filename: React.PropTypes.string,
};

module.exports = FilenameLabel;
