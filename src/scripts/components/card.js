export const likeCard = (likeButton, likeCountElement, likes, userId) => {
  const isLiked = likes.some((user) => user._id === userId);
  likeButton.classList.toggle("card__like-button_is-active", isLiked);
  likeCountElement.textContent = likes.length;
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

  cardImage.src = data.link;
  cardImage.alt = data.name;
  cardTitle.textContent = data.name;

  likeCard(likeButton, likeCountElement, data.likes || [], userId);

  if (data.owner && data.owner._id === userId) {
    deleteButton.addEventListener("click", () => onDeleteCard(data._id, cardElement));
  } else {
    deleteButton.remove();
  }

  likeButton.addEventListener("click", () => onLikeCard(data, likeButton, likeCountElement));
  cardImage.addEventListener("click", () => onPreviewPicture({ name: data.name, link: data.link }));

  return cardElement;
};
