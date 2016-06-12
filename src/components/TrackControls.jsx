const React = require('react');

const TrackControls = props => {
    const disabled = props.error !== undefined || props.filename === undefined;
console.log(disabled, props);

    let playOrPause;
    if (props.action === 'play') {
        playOrPause = (
            <button
                className="btn btn-secondary btn-sm"
                disabled={disabled}
                onClick={props.onPause}
            >
                Pause
            </button>
        );
    } else {
        playOrPause = (
            <button
                className="btn btn-secondary btn-sm"
                disabled={disabled}
                onClick={props.onPlay}
            >
                Play
            </button>
        );
    }

    return (
        <div>
            {playOrPause}
            <button
                className="btn btn-secondary btn-sm"
                disabled={disabled}
                onClick={props.onStop}
                style={{marginLeft: '0.25em'}}
            >
                Stop
            </button>
        </div>
    );
};

TrackControls.propTypes = {
    action: React.PropTypes.string,
    error: React.PropTypes.shape({
        type: React.PropTypes.string.isRequired,
        message: React.PropTypes.string.isRequired,
    }),
    filename: React.PropTypes.string,
    onPause: React.PropTypes.func,
    onPlay: React.PropTypes.func,
    onStop: React.PropTypes.func,
};

module.exports = TrackControls;
