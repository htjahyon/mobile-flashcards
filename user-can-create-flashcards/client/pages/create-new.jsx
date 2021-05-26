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
    this.flashcards = [
      {
        front: 'Add question.',
        back: 'Add answer.'
      }
    ];
    this.index = 0;
    this.state =
    {
      title: 'Untitled',
      content: this.flashcards[0].front,
      front: true
    };
    this.onChangeTitle = this.onChangeTitle.bind(this);
    this.onChangeContent = this.onChangeContent.bind(this);
    this.saveCard = this.saveCard.bind(this);
    this.previousClick = this.previousClick.bind(this);
    this.nextClick = this.nextClick.bind(this);
    this.deleteCard = this.deleteCard.bind(this);
    this.flipCard = this.flipCard.bind(this);
    this.addCard = this.addCard.bind(this);
  }

  onChangeTitle(event) {
    this.setState({ title: event.target.value });
  }

  onChangeContent(event) {
    this.setState({ content: event.target.value });
  }

  saveCard() {
    if (this.state.front) { this.flashcards[this.index].front = this.state.content; } else { this.flashcards[this.index].back = this.state.content; }
  }

  previousClick() {
    if (this.index > 0) {
      this.index--;
      this.setState(
        {
          content: this.flashcards[this.index].front
        }
      );
    }
  }

  nextClick() {
    if (this.index < this.flashcards.length - 1) {
      this.index++;
      this.setState(
        {
          content: this.flashcards[this.index].front
        }
      );
    }
  }

  deleteCard() {
    if (this.index > 0 && this.flashcards.length > 1) {
      this.flashcards.splice(this.index, 1);
      this.index--;
    } else if (this.index === 0 && this.flashcards.length > 1) {
      this.flashcards.splice(this.index, 1);
    } else {
      this.flashcards[this.index] =
      {
        front: 'Add question.',
        back: 'Add answer.'
      };
    }
    this.setState({ content: this.flashcards[this.index].front });
  }

  flipCard() {
    this.saveCard();
    const flip = !this.state.front;
    this.setState({ front: flip });
    if (this.state.front) { this.setState({ content: this.flashcards[this.index].front }); } else { this.setState({ content: this.flashcards[this.index].back }); }
  }

  addCard() {
    this.index++;
    this.flashcards.push(
      {
        front: 'Add question.',
        back: 'Add answer.'
      }
    );
    this.setState({ content: this.flashcards[this.index].front });
  }

  render() {

    return (
      <div style={style.container}>
        <div style={style.icons}>
          <a href="#"><img className="home-icon"></img></a>
          <form className="w-100">
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
          <img className="save" onClick={this.saveCard}></img>
        </div>
        <h2 className="track-cards">{this.index + 1}/{this.flashcards.length}</h2>
        <div className="space">
          <img className="previous" onClick={this.previousClick} />
            <form className="w-100">
              <div className="mb-3">
                <input
                  required
                  autoFocus
                  id="flashcardsContent"
                  type="text"
                  name="flashcardsContent"
                  value={this.state.content}
                  onChange={this.onChangeContent}
                  className="form-control bg-light" />
              </div>
            </form>
          <img className="next" onClick={this.nextClick} />
        </div>
        <div className="bottom-space">
          <img className="delete" onClick={this.deleteCard}></img>
          <img className="front-back" onClick={this.flipCard}></img>
          <img className="add" onClick={this.addCard}></img>
        </div>
      </div>
    );
  }
}
CreateNew.contextType = AppContext;
