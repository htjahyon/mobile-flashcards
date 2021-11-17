import React from 'react';
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
    justifyContent: 'center'
  }
};

export default class EditCards extends React.Component {
  constructor(props) {
    super(props);
    this.flashcards = [];
    this.index = 0;
    this.question = true;
    this.isDeletedAll = false;
    this.maxCards = 100;
    this.userId = this.props.userId;
    this.title = this.props.batch.batchName;
    this.batch = this.props.batch;
    this.shareId = this.props.batch.shareId;
    this.state =
    {
      title: this.title,
      content: '',
      deleteAll: false
    };
    this.startOver = this.startOver.bind(this);
    this.onChangeTitle = this.onChangeTitle.bind(this);
    this.onChangeContent = this.onChangeContent.bind(this);
    this.onChangeIndex = this.onChangeIndex.bind(this);
    this.saveCard = this.saveCard.bind(this);
    this.saveAll = this.saveAll.bind(this);
    this.deleteAll = this.deleteAll.bind(this);
    this.previousClick = this.previousClick.bind(this);
    this.nextClick = this.nextClick.bind(this);
    this.deleteCard = this.deleteCard.bind(this);
    this.flipCard = this.flipCard.bind(this);
    this.addCard = this.addCard.bind(this);
  }

  componentDidMount() {
    const numElement = document.getElementById('index');
    numElement.value = 1;
    if (this.batch.batchId === -1) return;
    fetch(`/api/cards/${this.batch.batchId}`)
      .then(res => res.json())
      .then(result => {
        this.flashcards = result;
        this.setState({ content: result[0].question });
      })
      .catch(error => console.error('Get index error!', error));
  }

  startOver() {
    const cardNum = this.flashcards[this.index].cardId;
    const card =
    {
      batchId: this.batch.batchId,
      question: 'Add question.',
      answer: 'Add answer.'
    };
    const req = {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(card)
    };
    fetch(`/api/cards/${cardNum}`, req)
      .then(res => res.json())
      .then(result => { this.flashcards.push(result); })
      .catch(error => console.error('Patch error!', error));
  }

  onChangeTitle(event) {
    this.setState({ title: event.target.value });
  }

  onChangeContent(event) {
    this.setState({ content: event.target.value });
  }

  onChangeIndex(event) {
    const numElement = document.getElementById('index');
    this.index = Number(numElement.value) - 1;
    if (this.index >= 0 && this.index < this.flashcards.length) {
      this.setState(
        {
          content: this.flashcards[this.index].question
        });
    }
  }

  saveCard(index) {
    if (this.question) {
      this.flashcards[index].question = this.state.content;
    } else {
      this.flashcards[index].answer = this.state.content;
    }
    const cardNum = this.flashcards[index].cardId;
    const card = {
      batchId: this.flashcards[index].batchId,
      question: this.flashcards[index].question,
      answer: this.flashcards[index].answer
    };
    const req = {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(card)
    };
    fetch(`/api/cards/${cardNum}`, req)
      .then(res => res.json())
      .then(result => { })
      .catch(error => console.error('Patch error!', error));
  }

  saveAll() {
    const modal = document.querySelector('.modal');
    modal.style = 'display: flex';
    window.onclick = function (event) {
      if (event.target.className === 'ok') {
        modal.style = 'display: none';
      }
    };
    this.title = this.state.title;
    this.saveCard(this.index);
    const batch = {
      userId: this.userId,
      folderId: this.batch.folderId,
      batchId: this.batch.batchId,
      batchName: this.title
    };
    const req = {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(batch)
    };
    fetch(`/api/batches/${this.batch.batchId}`, req)
      .then(res => res.json())
      .then(result => { })
      .catch(error => console.error('Post batches error!', error));
  }

  deleteAll() {
    let choice = null;
    if (typeof this.shareId !== 'undefined') {
      const deleteModal = document.querySelector('.deleteModal');
      deleteModal.style = 'display: flex';
      window.onclick = function (event) {
        if (event.target.className === 'yes' || event.target.className === 'no') {
          deleteModal.style = 'display: none';
          choice = event.target.className;
        }
      };
    }
    if (choice === 'no') return;
    const req = {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    fetch(`/api/batches/${this.batch.batchId}`, req)
      .then(res => res.json())
      .then(result => { })
      .catch(error => console.error('Delete batches error!', error));
    for (let i = 0; i < this.flashcards.length; i++) {
      const cardId = this.flashcards[i].cardId;
      fetch(`/api/cards/${cardId}`, req)
        .then(res => res.json())
        .then(result => { })
        .catch(error => console.error('Delete cards error!', error));
    }
    if (typeof this.shareId !== 'undefined') {
      fetch(`/api/share/${this.shareId}`, req)
        .then(res => res.json())
        .then(result => { })
        .catch(error => console.error('Delete shareId failed!', error));
    }
    this.setState({ deleteAll: true });
  }

  previousClick() {
    this.saveCard(this.index);
    this.question = true;
    if (this.index > 0) {
      this.index--;
      const numElement = document.getElementById('index');
      numElement.value--;
      this.setState(
        {
          content: this.flashcards[this.index].question
        }
      );
    }
  }

  nextClick() {
    this.saveCard(this.index);
    this.question = true;
    if (this.index < this.flashcards.length - 1) {
      this.index++;
      const numElement = document.getElementById('index');
      numElement.value++;
      this.setState(
        {
          content: this.flashcards[this.index].question
        }
      );
    }
  }

  deleteCard(index) {
    this.question = true;
    fetch('/api/cards')
      .then(res => res.json())
      .then(result => {
        const cardNum = result[index].cardId;
        const req = {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        };
        const numElement = document.getElementById('index');
        if (this.index > 0 && this.flashcards.length > 1) {
          this.flashcards.splice(index, 1);
          this.index--;
          numElement.value = this.index + 1;
          fetch(`/api/cards/${cardNum}`, req);
        } else if (this.index === 0 && this.flashcards.length > 1) {
          this.flashcards.splice(index, 1);
          fetch(`/api/cards/${cardNum}`, req);
        } else {
          this.startOver();
        }
        this.setState({ content: this.flashcards[this.index].question });
      })
      .catch(error => console.error('Get error!', error));
  }

  flipCard() {
    this.saveCard(this.index);
    this.question = !this.question;
    if (this.question) {
      this.setState({ content: this.flashcards[this.index].question });
    } else {
      this.setState({ content: this.flashcards[this.index].answer });
    }
  }

  addCard() {
    if (this.flashcards.length >= this.maxCards) return;
    this.saveCard(this.index);
    this.index = this.flashcards.length;
    const numElement = document.getElementById('index');
    numElement.value = this.index + 1;
    this.question = true;
    const card = {
      batchId: this.batch.batchId,
      question: 'Add question.',
      answer: 'Add answer.'
    };
    const req = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(card)
    };
    fetch('/api/cards', req)
      .then(res => res.json())
      .then(result => {
        this.flashcards.push(result);
        this.setState({ content: result.question });
      })
      .catch(error => console.error('Post error!', error));
  }

  render() {
    if (this.batch.batchId === -1) {
      return (
        <div style={style.container}>
          <h1 className="track-cards">No Recent Batch Yet!</h1>
          <div className="track-cards shrug"></div>
          <a href="#" className="track-cards">Go Home</a>
        </div>
      );
    }
    const sideText = this.question === true
      ? 'Question'
      : 'Answer';
    if (this.state.deleteAll) {
      return (
        <div style={style.container}>
          <h1 className="track-cards">Flashcards Deleted!</h1>
          <div className="trash-can track-cards"></div>
          <a href="#" className="track-cards">Go Home</a>
        </div>
      );
    }
    return (
      <div style={style.container}>
        <div style={style.icons}>
          <a className="home-icon" href="#"></a>
          <a className="self-assessment" onClick={() => this.props.setActiveBatch(this.batch)} href="#self-assessment"></a>
          <div className="save-all" onClick={this.saveAll}></div>
          <div className="delete-all" onClick={this.deleteAll}></div>
        </div>
        <form className="w-100 create-title">
          <div className="mb-3">Batch Name:
            <input
              required
              autoFocus
              id="flashcardsName"
              type="text"
              name="flashcardsName"
              value={this.state.title}
              onChange={this.onChangeTitle}
              className="flashcards-title bg-light" />
          </div>
        </form>
        <h2 className="track-cards">
          <input
          required
          autoFocus
          id="index"
          type="text"
          name="index"
          onChange={this.onChangeIndex}
          className="index bg-light" />/{this.flashcards.length}</h2>
        <div className="space">
          <div className="previous" onClick={this.previousClick} />
          <form className="w-100">
            <div className="mb-3">
              <textarea
                required
                autoFocus
                id="flashcardsContent"
                type="text"
                name="flashcardsContent"
                value={this.state.content}
                onChange={this.onChangeContent}
                className="form-control bg-light content" />
            </div>
          </form>
          <div className="next" onClick={this.nextClick} />
        </div>
        <h2 className="track-cards">{sideText}</h2>
        <div className="bottom-space">
          <div className="delete" onClick={() => this.deleteCard(this.index)}></div>
          <div className="question-answer" onClick={this.flipCard}></div>
          <div className="add" onClick={this.addCard}></div>
        </div>
        <div className="modal">
          <p className="modalText">Flashcards Saved!</p>
          <button className="ok">OK</button>
        </div>
        <div className="deleteModal">
          <p className="deleteText">Are you sure you want to delete this shared batch? It will also
             be deleted on inventory side of the user who created it.</p>
          <button className="yes">Yes</button>
          <button className="no">No</button>
        </div>
      </div>
    );
  }
}
EditCards.contextType = AppContext;
