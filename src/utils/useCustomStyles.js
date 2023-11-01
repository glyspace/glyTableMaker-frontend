import { useState, useEffect } from 'react';
import { css } from '@emotion/css';

const useCustomStyles = (styles, themeData) => {
  const [generatedClasses, setGeneratedClasses] = useState(null);

  useEffect(() => {
    if (!generatedClasses) {
      const evaluatedStyles = typeof styles === 'function' ? styles(themeData) : styles;
      const generated = {};

      for (const key in evaluatedStyles) {
        generated[key] = css(evaluatedStyles[key]);
      }

      setGeneratedClasses(generated);
    }
  }, [styles, themeData, generatedClasses]);

  return generatedClasses || {};
};

export default useCustomStyles;