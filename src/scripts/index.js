import { createCardElement, deleteCard, likeCard } from "./components/card.js";
import { openModalWindow, closeModalWindow, setCloseModalWindowEventListeners } from "./components/modal.js";
import { enableValidation, clearValidation } from "./components/validation.js";
import {
  getUserInfo,
  getCardList,
  setUserInfo,
  setUserAvatar,
  addNewCard,
  deleteCardRequest,
  changeLikeCardStatus
} from "./components/api.js";

const validationSettings = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible"
};

const placesWrap = document.querySelector(".places__list");
const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(".popup__input_type_description");
const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");
const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");
const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");
const logoElement = document.querySelector(".header__logo");
const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");
const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input_type_avatar");
const usersStatsModalWindow = document.querySelector(".popup_type_info");
const usersStatsModalTitle = usersStatsModalWindow.querySelector(".popup__title");
const usersStatsModalInfoList = usersStatsModalWindow.querySelector(".popup__info");
const usersStatsModalText = usersStatsModalWindow.querySelector(".popup__text");
const usersStatsModalUsersList = usersStatsModalWindow.querySelector(".popup__list");
const infoDefinitionTemplate = document.getElementById("popup-info-definition-template").content;
const infoUserPreviewTemplate = document.getElementById("popup-info-user-preview-template").content;

let currentUserId = "";

const setSubmitButtonText = (buttonElement, text) => {
  buttonElement.textContent = text;
};

const formatDate = (date) => {
  return date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
};

const createInfoString = (term, description) => {
  const infoElement = infoDefinitionTemplate.querySelector(".popup__info-item").cloneNode(true);
  infoElement.querySelector(".popup__info-term").textContent = term;
  infoElement.querySelector(".popup__info-description").textContent = description;
  return infoElement;
};

const createUserPreview = (userName) => {
  const userElement = infoUserPreviewTemplate.querySelector(".popup__list-item").cloneNode(true);
  userElement.textContent = userName;
  return userElement;
};

const getCardsOwnersStats = (cards) => {
  const owners = new Map();

  cards.forEach((card) => {
    const owner = card.owner;

    if (!owner) {
      return;
    }

    if (owners.has(owner._id)) {
      const ownerData = owners.get(owner._id);
      ownerData.cardsCount += 1;
    } else {
      owners.set(owner._id, {
        name: owner.name,
        cardsCount: 1
      });
    }
  });

  return Array.from(owners.values()).sort((firstOwner, secondOwner) => {
    return secondOwner.cardsCount - firstOwner.cardsCount;
  });
};

const renderUsersStats = (cards) => {
  const usersStats = getCardsOwnersStats(cards);
  const totalLikes = cards.reduce((sum, card) => sum + (card.likes ? card.likes.length : 0), 0);

  usersStatsModalTitle.textContent = "Статистика пользователей";
  usersStatsModalText.textContent = "Авторы карточек";
  usersStatsModalInfoList.replaceChildren();
  usersStatsModalUsersList.replaceChildren();

  usersStatsModalInfoList.append(createInfoString("Карточек всего:", cards.length));
  usersStatsModalInfoList.append(createInfoString("Пользователей:", usersStats.length));
  usersStatsModalInfoList.append(createInfoString("Лайков всего:", totalLikes));

  if (cards.length > 0) {
    usersStatsModalInfoList.append(
      createInfoString("Первая создана:", formatDate(new Date(cards[cards.length - 1].createdAt)))
    );
    usersStatsModalInfoList.append(
      createInfoString("Последняя создана:", formatDate(new Date(cards[0].createdAt)))
    );
  }

  usersStats.forEach((user) => {
    usersStatsModalUsersList.append(createUserPreview(`${user.name}: ${user.cardsCount}`));
  });
};

const handleLogoClick = () => {
  getCardList()
    .then((cards) => {
      renderUsersStats(cards);
      openModalWindow(usersStatsModalWindow);
    })
    .catch((err) => {
      console.error(err);
    });
};

const renderUserInfo = ({ name, about, avatar, _id }) => {
  profileTitle.textContent = name;
  profileDescription.textContent = about;
  profileAvatar.style.backgroundImage = `url(${avatar})`;
  currentUserId = _id;
};

const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

const handleLikeCard = (cardData, likeButton, likeCountElement) => {
  const isLiked = cardData.likes.some((user) => user._id === currentUserId);

  changeLikeCardStatus(cardData._id, isLiked)
    .then((updatedCard) => {
      cardData.likes = updatedCard.likes;
      likeCard(likeButton, likeCountElement, updatedCard.likes, currentUserId);
    })
    .catch((err) => {
      console.error(err);
    });
};

const handleDeleteCard = (cardId, cardElement) => {
  deleteCardRequest(cardId)
    .then(() => {
      deleteCard(cardElement);
    })
    .catch((err) => {
      console.error(err);
    });
};

const createCard = (cardData) => {
  return createCardElement(cardData, currentUserId, {
    onPreviewPicture: handlePreviewPicture,
    onLikeCard: handleLikeCard,
    onDeleteCard: handleDeleteCard
  });
};

const renderCard = (cardData, place = "append") => {
  placesWrap[place](createCard(cardData));
};

const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();

  const submitButton = profileForm.querySelector(".popup__button");
  setSubmitButtonText(submitButton, "Сохранение...");

  setUserInfo({
    name: profileTitleInput.value,
    about: profileDescriptionInput.value
  })
    .then((userData) => {
      renderUserInfo(userData);
      closeModalWindow(profileFormModalWindow);
      clearValidation(profileForm, validationSettings);
    })
    .catch((err) => {
      console.error(err);
    })
    .finally(() => {
      setSubmitButtonText(submitButton, "Сохранить");
    });
};

const handleAvatarFormSubmit = (evt) => {
  evt.preventDefault();

  const submitButton = avatarForm.querySelector(".popup__button");
  setSubmitButtonText(submitButton, "Сохранение...");

  setUserAvatar({
    avatar: avatarInput.value
  })
    .then((userData) => {
      renderUserInfo(userData);
      closeModalWindow(avatarFormModalWindow);
      avatarForm.reset();
      clearValidation(avatarForm, validationSettings);
    })
    .catch((err) => {
      console.error(err);
    })
    .finally(() => {
      setSubmitButtonText(submitButton, "Сохранить");
    });
};

const handleCardFormSubmit = (evt) => {
  evt.preventDefault();

  const submitButton = cardForm.querySelector(".popup__button");
  setSubmitButtonText(submitButton, "Создание...");

  addNewCard({
    name: cardNameInput.value,
    link: cardLinkInput.value
  })
    .then((cardData) => {
      renderCard(cardData, "prepend");
      closeModalWindow(cardFormModalWindow);
      cardForm.reset();
      clearValidation(cardForm, validationSettings);
    })
    .catch((err) => {
      console.error(err);
    })
    .finally(() => {
      setSubmitButtonText(submitButton, "Создать");
    });
};

profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFormSubmit);

openProfileFormButton.addEventListener("click", () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  clearValidation(profileForm, validationSettings);
  openModalWindow(profileFormModalWindow);
});

profileAvatar.addEventListener("click", () => {
  avatarForm.reset();
  clearValidation(avatarForm, validationSettings);
  openModalWindow(avatarFormModalWindow);
});

openCardFormButton.addEventListener("click", () => {
  cardForm.reset();
  clearValidation(cardForm, validationSettings);
  openModalWindow(cardFormModalWindow);
});

logoElement.addEventListener("click", handleLogoClick);

const allPopups = document.querySelectorAll(".popup");
allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});

enableValidation(validationSettings);

Promise.all([getCardList(), getUserInfo()])
  .then(([cards, userData]) => {
    renderUserInfo(userData);
    cards.forEach((cardData) => {
      renderCard(cardData);
    });
  })
  .catch((err) => {
    console.error(err);
  });
