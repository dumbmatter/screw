const EventEmitter = require('events').EventEmitter;
const React = require('react');
const {SimpleFilter, SoundTouch} = require('../lib/soundtouch');
const ErrorAlert = require('./ErrorAlert.jsx');
const FilenameLabel = require('./FilenameLabel.jsx');
const TrackControls = require('./TrackControls.jsx');

const BUFFER_SIZE = 4096;

class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            action: 'stop',
            error: undefined,
            filename: undefined,
            pitch: 0.8,
            tempo: 0.8,
            status: [],
        };

        this.audioContext = new AudioContext();
        this.scriptProcessor = this.audioContext.createScriptProcessor(BUFFER_SIZE, 2, 2);

        this.soundTouch = new SoundTouch();
        this.soundTouch.pitch = this.state.pitch;
        this.soundTouch.tempo = this.state.tempo;

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

    setBuffer(buffer) {
        const bufferSource = this.audioContext.createBufferSource();
        bufferSource.buffer = buffer;

        const samples = new Float32Array(BUFFER_SIZE * 2);

        this.source = {
            extract: (target, numFrames, position) => {
                const l = buffer.getChannelData(0);
                const r = buffer.getChannelData(1);
                for (let i = 0; i < numFrames; i++) {
                    target[i * 2] = l[i + position];
                    target[i * 2 + 1] = r[i + position];
                }
                return Math.min(numFrames, l.length - position);
            },
        };
        this.f = new SimpleFilter(this.source, this.soundTouch);
        this.scriptProcessor.onaudioprocess = e => {
            const l = e.outputBuffer.getChannelData(0);
            const r = e.outputBuffer.getChannelData(1);
            const framesExtracted = this.f.extract(samples, BUFFER_SIZE);
            if (framesExtracted === 0) {
                this.pause();
            }
            for (let i = 0; i < framesExtracted; i++) {
                l[i] = samples[i * 2];
                r[i] = samples[i * 2 + 1];
            }
        };

        this.play();
    }

    play() {
        if (this.state.action !== 'play') {
            this.scriptProcessor.connect(this.audioContext.destination);
            this.emitter.emit('state', {action: 'play'});
        }
    }

    pause() {
        if (this.state.action === 'play') {
            this.scriptProcessor.disconnect(this.audioContext.destination);
            this.emitter.emit('state', {action: 'pause'});
        }
    }

    stop() {
        this.pause();
        this.f.sourcePosition = 0;
        this.emitter.emit('state', {action: 'stop'});
    }

    handleFileChange(e) {
        if (e.target.files.length > 0) {
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

                let buffer;
                try {
                    buffer = await this.audioContext.decodeAudioData(event.target.result);
                } catch (err) {
                    this.emitter.emit('state', {
                        error: {
                            message: err.message,
                            type: 'Decoding error',
                        },
                    });
                    return;
                }

                this.setBuffer(buffer);
            };
        }
    }

    handlePitchChange(e) {
        const pitch = e.target.value;
        this.soundTouch.pitch = pitch;
        this.setState({pitch});
    }

    handleTempoChange(e) {
        const tempo = e.target.value;
        this.soundTouch.tempo = tempo;
        this.setState({tempo});
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
                    <div className="col-xs-5 col-sm-3 col-lg-2" style={{paddingTop: '7px'}}>
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
