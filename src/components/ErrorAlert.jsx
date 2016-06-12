const React = require('react');

const ErrorAlert = props => {
    if (props.error === undefined) {
        return null;
    }

    return (
        <div className="alert alert-danger">
            <b>{props.error.type}:</b> {props.error.message}
        </div>
    );
};

ErrorAlert.propTypes = {
    error: React.PropTypes.shape({
        type: React.PropTypes.string.isRequired,
        message: React.PropTypes.string.isRequired,
    }),
};

module.exports = ErrorAlert;
