import React from 'react';
import Redirect from './redirect';
import AppContext from '../app-context';

const style = {
  container: {
    display: 'flex',
    flexDirection: 'column'
  },
  icons: {
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
    this.maxUsers = 5;
    this.maxBatches = 6;
    this.userId = this.props.userId;
    this.state = {
      users: [],
      batches: [],
      openId: 0
    };

    this.displayUsers = this.displayUsers.bind(this);
    this.displayCards = this.displayCards.bind(this);
    this.clickUser = this.clickUser.bind(this);
  }

  componentDidMount() {
    this.displayUsers();
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

  displayCards(userId) {
    fetch('/api/batches')
      .then(res => res.json())
      .then(data => {
        this.setState({
          batches: data
        });
      })
      .catch(err => console.error('Fetch failed!', err));
  }

  clickUser(userId) {
    this.setState({ openedId: userId });
    this.displayCards(userId);
    this.createNew = this.state.users.length > 0
      ? <img className="create-new-flashcards" onClick={() => this.props.setActiveUser(this.state.openedId)}></img>
      : null;
  }

  componentWillUnmount() {
    this.setState({
      users: null,
      batches: null
    });
  }

  render() {
    this.users = this.state.users.map(user => (
      <div key={user.userId}>
        <div className={`user ${user.userId === this.state.openedId ? 'person-black' : 'person-white'}`}
          onClick={() => this.clickUser(user.userId)}></div>
        <span className="title">{user.username}</span>
      </div>
    ));
    this.batches = this.state.batches.map(batch => (
      <div className="user" key={batch.batchId}>
        <a href="#edit-cards"><div className="batch" onClick={() => this.props.setActiveBatch(batch)}></div></a>
        <span className="title">{batch.cardsTitle}</span>
      </div>
    ));

    if (!this.context.user) return <Redirect to="sign-in" />;
    return (
      <div style={style.container}>
        <div style={style.icons}>
          <a href="#"><img className="home-icon"></img></a>
          <img className="track-cards share-logo"></img>
        </div>
        <h2>Other Users</h2>
        <div className="users">
          {this.users}
        </div>
        <h2>My Flashcards</h2>
        <div className="workspace">
          {this.batches}
          <a href="#create-new">{this.createNew}</a>
        </div>
      </div>
    );
  }
}
Share.contextType = AppContext;
