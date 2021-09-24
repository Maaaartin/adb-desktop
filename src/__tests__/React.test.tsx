/**
 * @jest-environment jsdom
 */

import Console from '../frontend/components/Console';
import { Provider } from 'react-redux';
import React from 'react';
import renderer from 'react-test-renderer';
import store from '../frontend/redux/store';

describe('react', () => {
  it('console', () => {
    const component = renderer.create(
      <Provider store={store}>
        <Console
          serial="test"
          exec={() => Promise.resolve({ output: '' })}
          openShell={() => null}
        />
      </Provider>,
      {
        createNodeMock: () => document.createElement('div'),
      }
    );
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
