import React from 'react';
import PropTypes from 'prop-types'
import Video from 'twilio-video';
import classNames from 'classnames';
import './App.css';

const propTypes = {
  liveRoom: PropTypes.shape({
    status: PropTypes.string,
    participantOne: PropTypes.string,
    participantTwo: PropTypes.string,
    token: PropTypes.string,
    identity: PropTypes.string,
  }),
}

class App extends React.Component {
  // Activity log.
  log(message) {
    const logDiv = document.getElementById('log');
    logDiv.innerHTML += `<p>&gt;&nbsp;${message}</p>`;
    logDiv.scrollTop = logDiv.scrollHeight;
  }

  // Attach the Tracks to the DOM.
  attachTracks(tracks, container) {
    console.log('attachTracks.container: ', container);
    tracks.forEach((track) => {
      container.appendChild(track.attach());
    });
  }

  // Detach the Tracks from the DOM.
  detachTracks(tracks) {
    tracks.forEach((track) => {
      track.detach().forEach((detachedElement) => {
        detachedElement.remove();
      });
    });
  }

  constructor(props) {
    super(props);
    this.state = {
      previewTracks: null,
      activeRoom: null,
      token: this.props.liveRoom.token,
      identity: this.props.liveRoom.identity,
    };

    this.handlePreviewButtonClick = this.handlePreviewButtonClick.bind(this);
    this.handleJoinRoomButtonClick = this.handleJoinRoomButtonClick.bind(this);
    this.handleLeaveRoomButtonClick = this.handleLeaveRoomButtonClick.bind(this);
    this.roomJoined = this.roomJoined.bind(this);
    // this.log = this.log.bind(this);

    console.log('App.jsx.props: ', props);
  }

  componentDidMount() {
    // const that = this;
    // fetch('/token')
    // .then(response =>
    //   response.json()
    // ).then((data) => {
    //   this.log('data: ', data);
    //   this.log('data.token: ', data.token);
    //   this.setState({ token: data.token, identity: data.identity })
    // });
  }

  // Attach the Participant's Tracks to the DOM.
  attachParticipantTracks(participant, container) {
    const tracks = Array.from(participant.tracks.values());
    this.attachTracks(tracks, container);
  }

  // Detach the Participant's Tracks from the DOM.
  detachParticipantTracks(participant) {
    const tracks = Array.from(participant.tracks.values());
    this.detachTracks(tracks);
  }

  // Successfully connected!
  roomJoined(room) {
    const previewTracks = this.state.previewTracks;
    window.room = room;
    this.setState({ activeRoom: window.room });

    this.log(`Joined as '${this.state.identity}'`);
    document.getElementById('button-join').style.display = 'none';
    document.getElementById('button-leave').style.display = 'inline';

    // Attach LocalParticipant's Tracks, if not already attached.
    let previewContainer = document.getElementById('local-media');
    if (!previewContainer.querySelector('video')) {
      this.attachParticipantTracks(room.localParticipant, previewContainer);
    }

    this.log('room.participants: ', room.participants);
    // Attach the Tracks of the Room's Participants.
    room.participants.forEach((participant) => {
      this.log(`Already in Room: '${participant.identity}'`);
      previewContainer = document.getElementById('remote-media');
      this.attachParticipantTracks(participant, previewContainer);
    });

    // When a Participant joins the Room, log the event.
    room.on('participantConnected', (participant) => {
      this.log(`Joining: '${participant.identity}'`);
    });

    // When a Participant adds a Track, attach it to the DOM.
    room.on('trackAdded', (track, participant) => {
      this.log(`${participant.identity} added track: ${track.kind}`);
      previewContainer = document.getElementById('remote-media');
      this.attachTracks([track], previewContainer);
    });

    // When a Participant removes a Track, detach it from the DOM.
    room.on('trackRemoved', (track, participant) => {
      this.log(`${participant.identity} removed track: ${track.kind}`);
      this.detachTracks([track]);
    });

    // When a Participant leaves the Room, detach its Tracks.
    room.on('participantDisconnected', (participant) => {
      this.log(`Participant '${participant.identity}' left the room`);
      this.detachParticipantTracks(participant);
    });

    // Once the LocalParticipant leaves the room, detach the Tracks
    // of all Participants, including that of the LocalParticipant.
    room.on('disconnected', () => {
      this.log('Left');
      if (previewTracks) {
        previewTracks.forEach((track) => {
          track.stop();
        });
      }
      this.detachParticipantTracks(room.localParticipant);
      room.participants.forEach(this.detachParticipantTracks);
      this.setState({ activeRoom: null });
      document.getElementById('button-join').style.display = 'inline';
      document.getElementById('button-leave').style.display = 'none';
    });
  }

  handlePreviewButtonClick(event) {
    console.log('preview button clicked!', event.target.value);
    let previewTracks = this.state.previewTracks;
    const localTracksPromise = previewTracks
      ? Promise.resolve(previewTracks)
      : Video.createLocalTracks();

    localTracksPromise.then((tracks) => {
      window.previewTracks = tracks;
      previewTracks = tracks;
      const previewContainer = document.getElementById('local-media');
      if (!previewContainer.querySelector('vconsoleideo')) {
        this.attachTracks(tracks, previewContainer);
      }
    }, (error) => {
      console.error('Unable to access local media', error);
      this.log('Unable to access Camera and Microphone');
    });
  }

  // Bind button to join Room.
  handleJoinRoomButtonClick(event) {
    console.log('state: ', this.state);
    const previewTracks = this.state.previewTracks;
    let roomName = document.getElementById('room-name').value;

    // if (!roomName) {
    //   alert('Please enter a room name.');
    //   return;
    // }
    roomName = 'Test user';

    this.log(`Joining room '${roomName}'...`);
    const connectOptions = {
      name: roomName,
      logLevel: 'debug',
    };

    if (previewTracks) {
      connectOptions.tracks = previewTracks;
    }

    // Join the Room with the token from the server and the
    // LocalParticipant's Tracks.
    Video.connect(this.state.token, connectOptions)
    .then(this.roomJoined, (error) => {
      this.log(`Could not connect to Twilio: ${error.message}`);
    });
  }

  handleLeaveRoomButtonClick(event) {
    this.log('Leaving room...');
    this.state.activeRoom.disconnect();
    this.setState({ activeRoom: null }); // TODO: check! might be buggy
  }

  render() {
    const widgetClasses = classNames('erxes-widget');
    return (
      <div className={widgetClasses}>
        <div id="remote-media" />
        <div id="controls">
          <div id="preview">
            <p className="instructions">Hello Beautiful</p>
            <div id="local-media" />
            <button id="button-preview" onClick={this.handlePreviewButtonClick}>
              Preview My Camera
            </button>
          </div>
          <div id="room-controls">
            <p className="instructions">Room Name:</p>
            <input id="room-name" type="text" placeholder="Enter a room name" />
            <button id="button-join" onClick={this.handleJoinRoomButtonClick}>Join Room</button>
            <button id="button-leave" onClick={this.handleLeaveRoomButtonClick}>Leave Room</button>
          </div>
          <div id="log" />
        </div>
      </div>
    );
  }
}

App.propTypes = propTypes;

export default App;
