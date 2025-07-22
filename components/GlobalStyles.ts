export const Colors = {
  primary: '#000000',
  white: '#fff',
  green: '#00C853',
  red: '#FF1744',
  gray: '#bbb',
  darkGray: '#2E2E2E',
  lightGray: '#ccc',
};

export const Fonts = {
  regular: 'Poppins-Regular',
  bold: 'Poppins-Bold',
  semiBold: 'Poppins-SemiBold',
};

export const Spacing = {
  small: 8,
  medium: 16,
  large: 24,
};

export const GlobalStyles = {
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.medium,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.medium,
    paddingTop: Spacing.large,
    marginBottom: Spacing.medium,
  },
  title: {
    color: Colors.white,
    fontSize: 22,
    fontFamily: Fonts.bold,
    textAlign: 'center',
  },
  subtitle: {
    color: Colors.lightGray,
    fontSize: 16,
    fontFamily: Fonts.regular,
    textAlign: 'center',
  },
  button: {
    backgroundColor: Colors.darkGray,
    borderRadius: Spacing.small,
    paddingVertical: Spacing.medium,
    alignItems: 'center',
    justifyContent: 'center',
    width: '85%',
  },
  buttonText: {
    color: Colors.white,
    fontSize: 18,
    fontFamily: Fonts.bold,
  },
};
