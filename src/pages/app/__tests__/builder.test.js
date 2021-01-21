import { navigate as mockNavigateFunction } from 'gatsby';
import React from 'react';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react';

import FirebaseStub, { DatabaseConstants } from 'gatsby-plugin-firebase';

import { SettingsProvider } from '../../../contexts/SettingsContext';
import { ModalProvider } from '../../../contexts/ModalContext';
import { UserProvider } from '../../../contexts/UserContext';
import {
  DatabaseProvider,
  DebounceWaitTime,
} from '../../../contexts/DatabaseContext';
import { ResumeProvider } from '../../../contexts/ResumeContext';
import { StorageProvider } from '../../../contexts/StorageContext';
import Builder from '../builder';

describe('Builder', () => {
  let resumeId = null;
  let resume = null;
  let mockDatabaseUpdateFunction = null;
  const loadingScreenTestId = 'loading-screen';

  async function setup(
    resumeIdParameter,
    waitForLoadingScreenToDisappear = true,
    waitForDatabaseUpdateFunctionToHaveCompleted = true,
  ) {
    FirebaseStub.database().initializeData();

    resumeId = resumeIdParameter;
    resume = (
      await FirebaseStub.database()
        .ref(`${DatabaseConstants.resumesPath}/${resumeId}`)
        .once('value')
    ).val();

    mockDatabaseUpdateFunction = jest.spyOn(
      FirebaseStub.database().ref(
        `${DatabaseConstants.resumesPath}/${resumeId}`,
      ),
      'update',
    );

    FirebaseStub.auth().signInAnonymously();

    render(
      <SettingsProvider>
        <ModalProvider>
          <UserProvider>
            <DatabaseProvider>
              <ResumeProvider>
                <StorageProvider>
                  <Builder id={resumeId} />
                </StorageProvider>
              </ResumeProvider>
            </DatabaseProvider>
          </UserProvider>
        </ModalProvider>
      </SettingsProvider>,
    );

    if (waitForLoadingScreenToDisappear) {
      await waitForElementToBeRemoved(() =>
        screen.getByTestId(loadingScreenTestId),
      );
    }

    if (waitForDatabaseUpdateFunctionToHaveCompleted) {
      await waitFor(() => mockDatabaseUpdateFunction.mock.calls[0][0], {
        timeout: DebounceWaitTime,
      });
      await waitFor(() => mockDatabaseUpdateFunction.mock.results[0].value);
      mockDatabaseUpdateFunction.mockClear();
    }
  }

  describe('handles errors', () => {
    describe('if resume does not exist', () => {
      beforeEach(async () => {
        await setup('xxxxxx', false, false);
      });

      it('navigates to Dashboard', async () => {
        await waitFor(() =>
          expect(mockNavigateFunction).toHaveBeenCalledTimes(1),
        );
        expect(mockNavigateFunction).toHaveBeenCalledWith('/app/dashboard');
      });
    });
  });

  describe('renders', () => {
    beforeEach(async () => {
      await setup(DatabaseConstants.demoStateResume1Id);
    });

    it('first and last name', () => {
      expect(
        screen.getByRole('textbox', { name: /first name/i }),
      ).toHaveDisplayValue(resume.profile.firstName);
      expect(
        screen.getByRole('textbox', { name: /last name/i }),
      ).toHaveDisplayValue(resume.profile.lastName);
      expect(
        screen.getAllByText(new RegExp(resume.profile.firstName, 'i')).length,
      ).toBeTruthy();
      expect(
        screen.getAllByText(new RegExp(resume.profile.lastName, 'i')).length,
      ).toBeTruthy();
    });
  });

  describe('settings', () => {
    const languageStorageItemKey = 'language';

    beforeEach(async () => {
      await setup(DatabaseConstants.demoStateResume1Id);
    });

    it('allow to change the language', async () => {
      const languageElement = screen.getByLabelText(/language/i);
      const italianLanguageCode = 'it';
      const now = new Date().getTime();

      fireEvent.change(languageElement, {
        target: { value: italianLanguageCode },
      });

      expect(languageElement).toHaveValue(italianLanguageCode);

      expect(screen.queryByLabelText(/date of birth/i)).not.toBeInTheDocument();
      expect(screen.getByLabelText(/data di nascita/i)).toBeInTheDocument();

      const languageStorageItem = localStorage.getItem(languageStorageItemKey);
      expect(languageStorageItem).toBe(italianLanguageCode);

      await waitFor(
        () => expect(mockDatabaseUpdateFunction).toHaveBeenCalledTimes(1),
        {
          timeout: DebounceWaitTime,
        },
      );
      const mockDatabaseUpdateFunctionCallArgument =
        mockDatabaseUpdateFunction.mock.calls[0][0];
      expect(mockDatabaseUpdateFunctionCallArgument.id).toBe(resumeId);
      expect(mockDatabaseUpdateFunctionCallArgument.metadata.language).toBe(
        italianLanguageCode,
      );
      expect(
        mockDatabaseUpdateFunctionCallArgument.updatedAt,
      ).toBeGreaterThanOrEqual(now);
      await waitFor(() =>
        expect(
          mockDatabaseUpdateFunction.mock.results[0].value,
        ).resolves.toBeUndefined(),
      );
    });

    afterEach(() => {
      const englishLanguageCode = 'en';
      localStorage.setItem(languageStorageItemKey, englishLanguageCode);
    });
  });

  describe('updates data', () => {
    beforeEach(async () => {
      await setup(DatabaseConstants.demoStateResume1Id);
    });

    it('when input value is changed', async () => {
      const input = screen.getByRole('textbox', { name: /address line 1/i });
      const newInputValue = 'test street 123';
      const now = new Date().getTime();

      fireEvent.change(input, { target: { value: newInputValue } });

      expect(input.value).toBe(newInputValue);

      await waitFor(
        () => expect(mockDatabaseUpdateFunction).toHaveBeenCalledTimes(1),
        {
          timeout: DebounceWaitTime,
        },
      );
      const mockDatabaseUpdateFunctionCallArgument =
        mockDatabaseUpdateFunction.mock.calls[0][0];
      expect(mockDatabaseUpdateFunctionCallArgument.id).toBe(resumeId);
      expect(mockDatabaseUpdateFunctionCallArgument.profile.address.line1).toBe(
        newInputValue,
      );
      expect(
        mockDatabaseUpdateFunctionCallArgument.updatedAt,
      ).toBeGreaterThanOrEqual(now);
      await waitFor(() =>
        expect(
          mockDatabaseUpdateFunction.mock.results[0].value,
        ).resolves.toBeUndefined(),
      );
    });
  });

  describe('while loading', () => {
    beforeEach(async () => {
      await setup(DatabaseConstants.demoStateResume1Id, false, false);
    });

    it('renders loading screen', () => {
      expect(screen.getByTestId(loadingScreenTestId)).toBeInTheDocument();
    });
  });
});
