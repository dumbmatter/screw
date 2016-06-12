const EventEmitter = require('events').EventEmitter;
const React = require('react');
const ErrorAlert = require('./ErrorAlert.jsx');
const FilenameLabel = require('./FilenameLabel.jsx');

class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            bufferSource: undefined,
            error: undefined,
            filename: undefined,
            playbackRate: 0.8,
            status: [],
        };

        this.audioContext = new AudioContext();

        this.emitter = new EventEmitter();
        this.emitter.on('state', state => this.setState(state));
        this.emitter.on('status', status => {
            if (status === 'Done!') {
                this.setState({status: []});
            } else {
                this.setState({status: this.state.status.concat(status)});
            }
        });
    }


    playSound(buffer) {
        const bufferSource = this.audioContext.createBufferSource();
        bufferSource.playbackRate.value = this.state.playbackRate;
        bufferSource.buffer = buffer;
        bufferSource.connect(this.audioContext.destination);
        bufferSource.start(0);

        this.setState({bufferSource});
    }

    handleFileChange(e) {
        if (e.target.files.length > 0) {
            if (this.state.bufferSource) {
                this.state.bufferSource.stop();
            }

            this.emitter.emit('status', 'Reading file...');
            this.emitter.emit('state', {
                error: undefined,
                filename: undefined,
                rows: [],
            });

            // http://stackoverflow.com/q/4851595/786644
            const filename = e.target.value.replace('C:\\fakepath\\', '');
            this.emitter.emit('state', {filename});

            const file = e.target.files[0];

            const reader = new FileReader();
            reader.readAsArrayBuffer(file);
            reader.onload = async event => {
                this.emitter.emit('status', 'Playing file...');
                try {
                    const buffer = await this.audioContext.decodeAudioData(event.target.result);
                    this.playSound(buffer);
                } catch (err) {
                    this.emitter.emit('state', {
                        error: {
                            message: err.message,
                            type: 'Decoding error',
                        },
                    });
                }
            };
        }
    }

    handleSpeedChange(e) {
        const playbackRate = e.target.value;
        if (this.state.bufferSource) {
            this.state.bufferSource.playbackRate.value = playbackRate;
        }
        this.setState({playbackRate});
    }

    render() {
        return (
            <div className="container" style={{marginTop: '1em'}}>
                <div style={{marginBottom: '1em'}}>
                    <label
                        className="btn btn-primary btn-lg"
                        htmlFor="sas-file"
                        style={{marginRight: '0.25em'}}
                    >
                        <input
                            id="sas-file"
                            accept="audio"
                            type="file"
                            style={{display: 'none'}}
                            onChange={e => this.handleFileChange(e)}
                        />
                        Select MP3
                    </label>
                    <FilenameLabel error={this.state.error} filename={this.state.filename} />
                </div>
                <ErrorAlert error={this.state.error} />
                <div className="row">
                    <div className="col-sm-3 col-md-2" style={{paddingTop: '7px'}}>
                        Speed ({this.state.playbackRate}x)
                    </div>
                    <div className="col-sm-9 col-md-10">
                        <input
                            className="form-control"
                            id="speed-slider"
                            type="range"
                            min="0.1"
                            max="2"
                            step="0.1"
                            defaultValue={this.state.playbackRate}
                            onChange={e => this.handleSpeedChange(e)}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = App;
