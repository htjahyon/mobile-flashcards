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
    height: '100px'
  }
};

export default class Home extends React.Component {
  constructor(props) {
    super(props);
    this.folders = null;
    this.batches = null;
    this.maxFolders = 10;
    this.maxBatches = 18;
    this.addFolder = null;
    this.createNew = null;
    this.trash = null;
    this.recent = null;
    this.recentArray = [];
    this.received = null;
    this.folderClicked = false;
    this.userId = this.props.userId;
    this.state = {
      folders: [],
      batches: [],
      received: [],
      openedId: 0
    };

    this.displayFolders = this.displayFolders.bind(this);
    this.displayCards = this.displayCards.bind(this);
    this.addNewFolder = this.addNewFolder.bind(this);
    this.clickFolder = this.clickFolder.bind(this);
    this.recentBatch = this.recentBatch.bind(this);
    this.trashFolder = this.trashFolder.bind(this);
    this.getReceived = this.getReceived.bind(this);
  }

  componentDidMount() {
    this.displayFolders();
    this.recentBatch();
    this.getReceived();
  }

  displayFolders() {
    fetch(`/api/userFolders/${this.userId}`)
      .then(res => res.json())
      .then(data => {
        this.setState({
          folders: data
        });
      })
      .catch(err => console.error('Fetch folders failed!', err));
  }

  displayCards(folderId) {
    fetch(`/api/batches/${folderId}`)
      .then(res => res.json())
      .then(data => {
        this.setState({
          batches: data
        });
      })
      .catch(err => console.error('Fetch failed!', err));
  }

  addNewFolder() {
    if (this.state.folders.length >= this.maxFolders) return;
    let biggest = 1;
    for (let i = 0; i < this.state.folders.length; i++) {
      if (this.state.folders[i].folderId > biggest) {
        biggest = this.state.folders[i].folderId;
      }
    }
    const folder = {
      folderName: 'Folder ' + biggest,
      userId: this.userId
    };
    this.count++;
    const req = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(folder)
    };
    fetch('/api/folders/', req)
      .then(res => res.json())
      .then(result => { this.displayFolders(); })
      .catch(error => console.error('Post folder error!', error));

  }

  clickFolder(folderId) {
    this.setState({ openedId: folderId });
    this.displayCards(folderId);
    this.folderClicked = true;
  }

  recentBatch() {
    fetch(`/api/userFolders/${this.userId}`)
      .then(res => res.json())
      .then(folders => {
        for (let i = 0; i < folders.length; i++) {
          fetch(`/api/batches/${folders[i].folderId}`)
            .then(res => res.json())
            .then(batches => {
              for (let j = 0; j < batches.length; j++) {
                this.recentArray.push(batches[j]);
              }
              if (this.recentArray.length === 0) {
                this.recentArray.push({
                  batchId: -1
                });
              }
            })
            .catch(err => console.error('Fetch batches failed!', err));
        }
      })
      .catch(err => console.error('Fetch folders failed!', err));
  }

  trashFolder(folderId) {
    this.folderClicked = false;
    for (let a = 0; a < this.state.folders.length; a++) {
      if (folderId === this.state.folders[a].folderId) {
        this.state.folders.splice(a, 1);
        --a;
      }
    }
    const req = {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    fetch(`api/folders/${folderId}`, req)
      .then(res => res.json())
      .then(result => {})
      .catch(error => console.error('Delete folder error!', error));
    const batchIdArray = [];
    for (let i = 0; i < this.state.batches.length; i++) {
      batchIdArray.push(this.state.batches[i].batchId);
      fetch(`api/batches/${this.state.batches[i].batchId}`, req)
        .then(res => res.json())
        .then(result => {})
        .catch(error => console.error('Delete batches error!', error));
    }
    for (let b = 0; b < batchIdArray.length; b++) {
      fetch(`api/cards/${batchIdArray[b]}`)
        .then(res => res.json())
        .then(result => {
          for (let c = 0; c < result.length; c++) {
            fetch(`api/cards/${result[c].cardId}`, req)
              .then(res1 => res1.json())
              .then(result1 => { })
              .catch(error1 => console.error('Delete cards error!', error1));
          }
        })
        .catch(error => console.error('Add batchId array error!', error));
    }
    this.displayFolders();
  }

  getReceived() {
    fetch(`/api/receive/${this.userId}`)
      .then(res => res.json())
      .then(result => {
        this.setState({ received: result });
      })
      .catch(error => console.error('getNotSent failed!', error));
  }

  componentWillUnmount() {
    this.setState({
      folders: null,
      batches: null
    });
  }

  render() {
    this.addFolder = this.state.folders.length < this.maxFolders
      ? <img className="add-new-folder" onClick={this.addNewFolder}></img>
      : null;
    this.createNew = this.folderClicked && this.state.batches.length < this.maxBatches
      ? <img className="create-new-flashcards" onClick={() => this.props.setActiveFolder(this.state.openedId)}></img>
      : null;
    this.trash = this.folderClicked && this.state.folders.length > 0
      ? <img className="trash" onClick={() => this.trashFolder(this.state.openedId)}></img>
      : null;
    this.folders = this.state.folders.map(folder => (
      <div key={folder.folderId}>
        <div className={`folder ${folder.folderId === this.state.openedId ? 'opened-folder' : 'closed-folder'}`}
        onClick={() => this.clickFolder(folder.folderId)}></div>
        <span className="title">{folder.folderName}</span>
      </div>
    ));
    this.batches = this.state.batches.map(batch => (
      <div className="folder" key={batch.batchId}>
       <a href="#edit-cards"><div className="batch" onClick={() => this.props.setActiveBatch(batch)}></div></a>
        <span className="title">{batch.batchName}</span>
      </div>
    ));
    this.received = this.state.received.map(share => (
      <div className="folder" key={share.shareId}>
        <a href="#edit-cards"><div className="batch" onClick={() => this.props.setActiveBatch(share)}></div></a>
        <span className="title">{share.batchName}</span>
      </div>
    ));

    if (!this.context.user) return <Redirect to="sign-in" />;
    const { handleSignOut } = this.context;
    return (
      <div style={style.container}>
        <div style={style.icons}>
          <a href="#scores"><img className="scores"></img></a>
          <a href="#edit-cards"><img className="recently-made" onClick={() => this.props.setActiveBatch(this.recentArray.pop())}></img></a>
          <a href="#share"><img className="share" onClick={() => this.props.setActiveUser(this.userId)}></img></a>
          <img className="logout" onClick={handleSignOut}></img>
        </div>
        <h2>My Folders</h2>
        <div className="folders">
          {this.folders}
          {this.addFolder}
          {this.trash}
        </div>
        <h2>My Flashcards</h2>
        <div className="workspace">
          {this.batches}
          <a href="#create-new">{this.createNew}</a>
        </div>
        <h2>Flashcards From Other Users</h2>
        <div className="workspace">
          {this.received}
        </div>
      </div>
    );
  }
}
Home.contextType = AppContext;
