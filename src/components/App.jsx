const EventEmitter = require('events').EventEmitter;
const React = require('react');
const ErrorAlert = require('./ErrorAlert.jsx');
const FilenameLabel = require('./FilenameLabel.jsx');
const TrackControls = require('./TrackControls.jsx');
const AudioPlayer = require('../lib/AudioPlayer');

class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            action: 'stop',
            duration: undefined,
            error: undefined,
            filename: undefined,
            pitch: 0.8,
            simpleFilter: undefined,
            status: [],
            t: 0,
            tempo: 0.8,
        };

        this.emitter = new EventEmitter();
        this.emitter.on('state', state => this.setState(state));
        this.emitter.on('status', status => {
            if (status === 'Done!') {
                this.setState({status: []});
            } else {
                this.setState({status: this.state.status.concat(status)});
            }
        });
        this.emitter.on('stop', () => this.stop());

        this.audioPlayer = new AudioPlayer({
            emitter: this.emitter,
            pitch: this.state.pitch,
            tempo: this.state.tempo,
        });
    }

    play() {
        if (this.state.action !== 'play') {
            this.audioPlayer.play();
            this.setState({action: 'play'});
        }
    }

    pause() {
        if (this.state.action === 'play') {
            this.audioPlayer.pause();
            this.setState({action: 'pause'});
        }
    }

    stop() {
        this.pause();
        this.audioPlayer.seekPercent(0);
        this.setState({action: 'stop', t: 0});
    }

    handleFileChange(e) {
        if (e.target.files.length > 0) {
            this.stop();

            this.emitter.emit('status', 'Reading file...');
            this.emitter.emit('state', {
                error: undefined,
                filename: undefined,
            });

            // http://stackoverflow.com/q/4851595/786644
            const filename = e.target.value.replace('C:\\fakepath\\', '');
            this.emitter.emit('state', {filename});

            const file = e.target.files[0];

            const reader = new FileReader();
            reader.readAsArrayBuffer(file);
            reader.onload = async event => {
                this.emitter.emit('status', 'Playing file...');

                let buffer;
                try {
                    buffer = await this.audioPlayer.decodeAudioData(event.target.result);
                } catch (err) {
                    this.emitter.emit('state', {
                        error: {
                            message: err.message,
                            type: 'Decoding error',
                        },
                    });
                    return;
                }

                this.audioPlayer.setBuffer(buffer);
                this.play();
            };
        }
    }

    handlePitchChange(e) {
        const pitch = e.target.value;
        this.audioPlayer.pitch = pitch;
        this.setState({pitch});
    }

    handleTempoChange(e) {
        const tempo = e.target.value;
        this.audioPlayer.tempo = tempo;
        this.setState({tempo});
    }

    handleSeek(e) {
        const percent = parseFloat(e.target.value);
        this.audioPlayer.seekPercent(percent);
        this.play();
    }

    percentDone() {
        if (!this.state.duration) {
            return 0;
        }

        return this.state.t / this.state.duration * 100;
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
                    <div className="col-xs-5 col-sm-3 col-lg-2" style={{paddingTop: '6px'}}>
                        <TrackControls
                            action={this.state.action}
                            error={this.state.error}
                            filename={this.state.filename}
                            onPlay={() => this.play()}
                            onPause={() => this.pause()}
                            onStop={() => this.stop()}
                        />
                    </div>
                    <div className="col-xs-7 col-sm-9 col-lg-10">
                        <input
                            className="form-control"
                            type="range"
                            min="0"
                            max="100"
                            step="0.05"
                            value={this.percentDone()}
                            onChange={e => this.handleSeek(e)}
                        />
                    </div>
                </div>

                <div className="row">
                    <div className="col-xs-5 col-sm-3 col-lg-2" style={{paddingTop: '7px'}}>
                        Pitch ({this.state.pitch}x)
                    </div>
                    <div className="col-xs-7 col-sm-9 col-lg-10">
                        <input
                            className="form-control"
                            type="range"
                            min="0.05"
                            max="2"
                            step="0.05"
                            defaultValue={this.state.pitch}
                            onChange={e => this.handlePitchChange(e)}
                        />
                    </div>
                </div>

                <div className="row">
                    <div className="col-xs-5 col-sm-3 col-lg-2" style={{paddingTop: '7px'}}>
                        Tempo ({this.state.tempo}x)
                    </div>
                    <div className="col-xs-7 col-sm-9 col-lg-10">
                        <input
                            className="form-control"
                            type="range"
                            min="0.05"
                            max="2"
                            step="0.05"
                            defaultValue={this.state.tempo}
                            onChange={e => this.handleTempoChange(e)}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = App;
