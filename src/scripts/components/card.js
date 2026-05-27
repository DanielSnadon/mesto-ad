export const isCardLiked = (likes, userId) => {
  return likes.some((user) => user._id === userId);
};

export const setCardLikeView = (likeButton, likeCountElement, likes, userId) => {
  likeButton.classList.toggle("card__like-button_is-active", isCardLiked(likes, userId));
  likeCountElement.textContent = likes.length;
};

export const updateCardLikes = (cardData, likeButton, likeCountElement, likes, userId) => {
  cardData.likes = likes;
  setCardLikeView(likeButton, likeCountElement, likes, userId);
};

export const deleteCard = (cardElement) => {
  cardElement.remove();
};

const getTemplate = () => {
  return document
    .getElementById("card-template")
    .content.querySelector(".card")
    .cloneNode(true);
};

export const createCardElement = (
  data,
  userId,
  { onPreviewPicture, onLikeCard, onDeleteCard }
) => {
  const cardElement = getTemplate();
  const likeButton = cardElement.querySelector(".card__like-button");
  const likeCountElement = cardElement.querySelector(".card__like-count");
  const deleteButton = cardElement.querySelector(".card__control-button_type_delete");
  const cardImage = cardElement.querySelector(".card__image");
  const cardTitle = cardElement.querySelector(".card__title");
  const likes = data.likes || [];

  cardImage.src = data.link;
  cardImage.alt = data.name;
  cardTitle.textContent = data.name;

  setCardLikeView(likeButton, likeCountElement, likes, userId);

  if (data.owner && data.owner._id === userId) {
    deleteButton.addEventListener("click", () => onDeleteCard(data._id, cardElement));
  } else {
    deleteButton.remove();
  }

  likeButton.addEventListener("click", () => {
    onLikeCard(data, isCardLiked(data.likes || [], userId), likeButton, likeCountElement);
  });
  cardImage.addEventListener("click", () => onPreviewPicture({ name: data.name, link: data.link }));

  return cardElement;
};
