import React from 'react';
import Redirect from './redirect';
import AppContext from '../app-context';

const style = {
  container: {
    display: 'flex',
    flexDirection: 'column'
  },
  icons: {
    display: 'flex',
    width: '100%',
    height: '100px',
    marginBottom: '10%'
  }
};

export default class Share extends React.Component {
  constructor(props) {
    super(props);
    this.users = null;
    this.batches = null;
    this.received = null;
    this.sent = null;
    this.maxUsers = 20;
    this.maxBatches = 50;
    this.maxSent = 30;
    this.maxReceived = 30;
    this.name = '';
    this.userId = this.props.userId;
    this.myArray = [];
    this.sentArray = [];
    this.state = {
      users: [],
      batches: [],
      sent: [],
      received: [],
      openId: 0
    };

    this.displayUsers = this.displayUsers.bind(this);
    this.displayMyCards = this.displayMyCards.bind(this);
    this.clickUser = this.clickUser.bind(this);
    this.sendBatch = this.sendBatch.bind(this);
    this.getName = this.getName.bind(this);
    this.getReceived = this.getReceived.bind(this);
    this.getSent = this.getSent.bind(this);
    this.alreadyThere = this.alreadyThere.bind(this);
    this.getNotSent = this.getNotSent.bind(this);
    this.deleteBatch = this.deleteBatch.bind(this);
  }

  componentDidMount() {
    this.displayUsers();
    this.displayMyCards();
    this.getNotSent();
  }

  displayUsers() {
    fetch(`/api/users/${this.userId}`)
      .then(res => res.json())
      .then(data => {
        this.setState({
          users: data
        });
      })
      .catch(err => console.error('Fetch users failed!', err));
  }

  displayMyCards() {
    fetch(`/api/userFolders/${this.userId}`)
      .then(res => res.json())
      .then(folders => {
        for (let i = 0; i < folders.length; i++) {
          fetch(`/api/batches/${folders[i].folderId}`)
            .then(res => res.json())
            .then(batches => {
              const end = this.maxBatches < batches.length ? this.maxBatches : batches.length;
              for (let j = 0; j < end; j++) {
                this.myArray.push(batches[j]);
              }
              this.setState({ batches: this.myArray });
            })
            .catch(err => console.error('Fetch batches failed!', err));
        }
      })
      .catch(err => console.error('Fetch folders failed!', err));
  }

  clickUser(userId, username) {
    this.setState({ openedId: userId });
    this.getReceived(userId);
    this.getSent(userId);
    this.button = this.state.batches.length > 0
      ? <button onClick={() => this.sendBatch(this.state.openedId)}>Send to {username}</button>
      : null;
  }

  sendBatch(openedId) {
    const checkedValue = [];
    const inputElements = document.getElementsByClassName('checkbox');
    for (let i = 0; i < inputElements.length; i++) {
      if (inputElements[i].checked) {
        checkedValue.push(parseInt(inputElements[i].value));
      }
    }
    for (let j = 0; j < checkedValue.length; j++) {
      if (!this.alreadyThere(checkedValue[j]) && j < this.maxSent) {
        const share = {
          sendUserId: this.userId,
          receiveUserId: openedId,
          batchId: checkedValue[j],
          batchName: this.getName(checkedValue[j])
        };
        const req = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(share)
        };
        fetch('/api/share', req)
          .then(res => res.json())
          .then(result => {
            this.deleteBatch(result.batchId);
            this.getSent(openedId);
            this.getNotSent();
            this.displayMyCards();
          })
          .catch(error => console.error('Fetch sendBatch failed!', error));
        const modal = document.querySelector('.modal');
        modal.style = 'display: flex';
        window.onclick = function (event) {
          if (event.target.className === 'ok') {
            modal.style = 'display: none';
          }
        };
      }
    }
  }

  getName(batchId) {
    for (let i = 0; i < this.state.batches.length; i++) {
      if (batchId === this.state.batches[i].batchId) { return this.state.batches[i].batchName; }
    }
    return null;
  }

  getReceived(userId) {
    fetch(`/api/receive/${this.userId}/${userId}`)
      .then(res => res.json())
      .then(result => {
        const temp = [];
        const end = result.length < this.maxReceived ? result.length : this.maxReceived;
        for (let i = 0; i < end; i++) {
          temp.push(result[i]);
        }
        this.setState({ received: temp });
      })
      .catch(error => console.error('getReceived failed!', error));
  }

  getSent(userId) {
    fetch(`/api/send/${this.userId}/${userId}`)
      .then(res => res.json())
      .then(result => {
        this.setState({ sent: result });
      })
      .catch(error => console.error('getReceived failed!', error));
  }

  alreadyThere(batchId) {
    for (let i = 0; i < this.state.sent.length; i++) {
      if (batchId === this.state.sent[i].batchId) {
        return true;
      }
    }
    return false;
  }

  getNotSent() {
    for (let i = 0; i < this.state.batches.length; i++) {
      for (let j = 0; j < this.state.sent.length; j++) {
        if (this.state.batches[i].batchId === this.state.sent[j].batchId) {
          this.state.batches.splice(i, 1);
          i--;
        }
      }
    }
  }

  deleteBatch(batchId) {
    for (let i = 0; i < this.state.batches.length; i++) {
      if (batchId === this.state.batches[i].batchId) {
        this.state.batches.splice(i, 1);
      }
    }
  }

  render() {
    this.users = this.state.users.map(user => (
      <div key={user.userId}>
        <div className={`${user.userId === this.state.openedId ? 'person-black' : 'person-white'}`}
          onClick={() => this.clickUser(user.userId, user.username)}></div>
        <span className="title">{user.username}</span>
      </div>
    ));
    this.batches = this.state.batches.map(batch => (
      <label className="check" key={batch.batchId}>
        <input className= "checkbox" type="checkbox" name="batch" value={batch.batchId}/>{batch.batchName}
      </label>
    ));
    this.received = this.state.received.map(batch => (
      <div key={batch.batchId}>
        <li>{batch.batchName}</li>
      </div>
    ));
    this.sent = this.state.sent.map(sent => (
      <div key={sent.batchId}>
        <li>{sent.batchName}</li>
      </div>
    ));
    if (!this.context.user) return <Redirect to="sign-in" />;
    return (
      <div style={style.container}>
        <div style={style.icons}>
          <a href="#"><div className="home-icon"></div></a>
          <div className="track-cards share-logo"></div>
        </div>
        <h2>Other Users</h2>
        <div className="users">
          {this.users}
        </div>
        <h2>My Flashcards</h2>
        <div className="workspace">
          <form>{this.batches}</form>
          {this.button}
        </div>
        <h2>Received Flashcards</h2>
        <div className="bullets">
          <form>{this.received}</form>
        </div>
        <h2>Sent Flashcards</h2>
        <div className="bullets">
          <form>{this.sent}</form>
        </div>
        <div className="modal">
            <p className="modalText">Batch(es) Sent!</p>
            <button className="ok">OK</button>
        </div>
      </div >
    );
  }
}
Share.contextType = AppContext;
