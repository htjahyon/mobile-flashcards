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

export default class CreateNew extends React.Component {
  constructor(props) {
    super(props);
    this.flashcards = [];
    this.index = 0;
    this.question = true;
    this.isDeletedAll = false;
    this.userId = this.props.userId;
    this.title = 'Untitled';
    this.folderId = this.props.folderId;
    this.batchId = null;
    this.start = false;
    this.display = null;
    this.maxCards = 100;
    this.state =
    {
      title: 'Untitled',
      content: 'Add question.',
      deleteAll: false
    };
    this.onChangeTitle = this.onChangeTitle.bind(this);
    this.onChangeContent = this.onChangeContent.bind(this);
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
    this.title = this.state.title;
    const batch = {
      userId: this.userId,
      folderId: this.folderId,
      batchName: this.title
    };
    let req = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(batch)
    };
    fetch('/api/batches', req)
      .then(res1 => res1.json())
      .then(result1 => {
        const card = {
          batchId: result1.batchId,
          question: 'Add question.',
          answer: 'Add answer.'
        };
        this.batchId = result1.batchId;
        req = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(card)
        };
        fetch('/api/cards', req)
          .then(res2 => res2.json())
          .then(result2 => {
            this.flashcards.push(result2);
          })
          .catch(error2 => console.error('Post error!', error2));
      })
      .catch(error1 => console.error('Post batches error!', error1));

  }

  onChangeTitle(event) {
    this.setState({ title: event.target.value });
  }

  onChangeContent(event) {
    this.setState({ content: event.target.value });
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
    // save flashcards into a folder
    this.title = this.state.title;
    this.saveCard(this.index);
    const batch = {
      userId: this.userId,
      folderId: this.folderId,
      batchName: this.title
    };
    const req = {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(batch)
    };
    fetch(`/api/batches/${this.batchId}`, req)
      .then(res => res.json())
      .then(result => { })
      .catch(error => console.error('Post batches error!', error));
  }

  deleteAll() {
    const req = {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    fetch(`/api/batches/${this.batchId}`, req)
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
    this.setState({ deleteAll: true });
  }

  previousClick() {
    this.saveCard(this.index);
    this.question = true;
    if (this.index > 0) {
      this.index--;
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
        if (this.index > 0 && this.flashcards.length > 1) {
          this.flashcards.splice(index, 1);
          this.index--;
          fetch(`/api/cards/${cardNum}`, req);
        } else if (this.index === 0 && this.flashcards.length > 1) {
          this.flashcards.splice(index, 1);
          fetch(`/api/cards/${cardNum}`, req);
        } else {
          this.flashcards.splice(index, 1);
          fetch(`/api/cards/${cardNum}`, req);
          this.componentDidMount();
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
    this.start = true;
    this.saveCard(this.index);
    this.index = this.flashcards.length;
    this.question = true;
    const card = {
      batchId: this.batchId,
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
    const sideText = this.question === true
      ? 'Question'
      : 'Answer';
    const length = this.start === true ? this.flashcards.length : 1;
    if (this.state.deleteAll) {
      return (
        <div style={style.container}>
          <h1 className="track-cards">Flashcards Deleted!</h1>
          <img className="trash-can track-cards"></img>
          <a href="#" className="track-cards">Go Home</a>
        </div>
      );
    }
    return (
      <div style={style.container}>
        <div style={style.icons}>
          <a href="#"><img className="home-icon"></img></a>
          <img className="save-all" onClick={this.saveAll}></img>
          <img className="delete-all" onClick={this.deleteAll}></img>
        </div>
        <form className="w-100 create-title">
          <div className="mb-3">
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
        <h2 className="track-cards">{this.index + 1}/{length}</h2>
        <div className="space">
          <img className="previous" onClick={this.previousClick} />
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
          <img className="next" onClick={this.nextClick} />
        </div>
        <h2 className="track-cards">{sideText}</h2>
        <div className="bottom-space">
          <img className="delete" onClick={() => this.deleteCard(this.index)}></img>
          <img className="question-answer" onClick={this.flipCard}></img>
          <img className="add" onClick={this.addCard}></img>
        </div>
      </div>
    );
  }
}
CreateNew.contextType = AppContext;
