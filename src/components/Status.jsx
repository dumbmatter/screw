const React = require('react');

const Status = props => {
    if (props.status.length === 0) {
        return null;
    }

    return (
        <ul className="list-status">
            {props.status.map((status, i) => <li key={i}>{status}</li>)}
        </ul>
    );
};

Status.propTypes = {
    status: React.PropTypes.arrayOf(React.PropTypes.string),
};

module.exports = Status;
