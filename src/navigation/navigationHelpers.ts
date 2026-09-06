import { CommonActions, NavigationProp, ParamListBase } from '@react-navigation/native';
import { Platform } from 'react-native';

export type BackFallbackRoute = {
  name: string;
  params?: object;
};

export const blurActiveElementOnWeb = () => {
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    const activeElement = document.activeElement as HTMLElement | null;
    activeElement?.blur?.();
  }
};

export const navigateBackOrTo = (
  navigation: NavigationProp<ParamListBase>,
  fallback: BackFallbackRoute = { name: 'HelpSupport' }
) => {
  blurActiveElementOnWeb();

  const state = navigation.getState();
  const targetIndex = state.routes.findIndex((route) => route.name === fallback.name);

  if (targetIndex >= 0 && targetIndex < state.index) {
    navigation.navigate({
      name: fallback.name,
      params: fallback.params,
      merge: true,
    });
    return;
  }

  if (state.index > 0) {
    const previousRoute = state.routes[state.index - 1];
    if (previousRoute) {
      navigation.navigate({
        name: previousRoute.name,
        params: previousRoute.params,
        merge: true,
      });
      return;
    }
  }

  navigation.dispatch(
    CommonActions.reset({
      index: 1,
      routes: [
        { name: 'MainTabs', params: { screen: 'Settings' } },
        { name: fallback.name, params: fallback.params },
      ],
    })
  );
};
