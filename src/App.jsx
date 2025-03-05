import React, { useState, useEffect, useRef } from 'react'
import './App.css'

function App() {
  const [decimalNumber, setDecimalNumber] = useState(['', '', '']);
  const [binaryNumber, setBinaryNumber] = useState([]);
  const [hexNumber, setHexNumber] = useState([]);
  
  // Visibility controls
  const [showPowerNotation, setShowPowerNotation] = useState(false);
  const [showPowerValue, setShowPowerValue] = useState(false);
  const [showProduct, setShowProduct] = useState(false);
  const [showTotal, setShowTotal] = useState(true);
  
  // Number system visibility controls
  const [showDecimal, setShowDecimal] = useState(true);
  const [showBinary, setShowBinary] = useState(true);
  const [showHex, setShowHex] = useState(true);
  
  // Control menu visibility
  const [showMenus, setShowMenus] = useState(false);
  
  // Create refs for the containers
  const decimalRefs = [useRef(null), useRef(null), useRef(null)];
  const binaryRowRef = useRef(null);
  const hexRowRef = useRef(null);

  // Convert between number systems when any input changes
  useEffect(() => {
    // If all fields are empty, reset the conversions
    if (decimalNumber.every(digit => digit === '')) {
      setBinaryNumber([]);
      setHexNumber([]);
      return;
    }

    // Create a padded array, replacing empty strings with '0'
    const paddedDecimal = [...decimalNumber].map(digit => digit === '' ? '0' : digit);
    
    // Calculate the actual decimal value
    const decimal = parseInt(paddedDecimal.join(''), 10);
    
    // Convert to binary and ensure proper display with 8 bits
    const binary = decimal.toString(2).padStart(8, '0').split('');
    setBinaryNumber(binary);
    
    // Convert to hex and ensure at least 2 digits
    const hex = decimal.toString(16).toUpperCase().padStart(2, '0').split('');
    setHexNumber(hex);

    // Show menus if any digits are entered
    if (!showMenus && decimalNumber.some(digit => digit !== '')) {
      setShowMenus(true);
    }
  }, [decimalNumber, showMenus]);

  // Show/hide menus based on whether there are digits entered
  useEffect(() => {
    const hasDigits = decimalNumber.some(digit => digit !== '');
    if (hasDigits && !showMenus) {
      setShowMenus(true);
    } else if (!hasDigits && showMenus) {
      // Optional: Hide menus again when all digits are cleared
      // Uncomment if you want menus to disappear when all digits are cleared
      // setShowMenus(false);
    }
  }, [decimalNumber, showMenus]);

  // Handle clear button click
  const handleClear = () => {
    setDecimalNumber(['0', '0', '0']);
  };

  // Toggle all visibility controls
  const toggleAllVisibility = (checked) => {
    setShowPowerNotation(checked);
    setShowPowerValue(checked);
    setShowProduct(checked);
    setShowTotal(checked);
  };

  // Toggle all number systems
  const toggleAllSystems = (checked) => {
    setShowDecimal(checked);
    setShowBinary(checked);
    setShowHex(checked);
  };

  // Get input element at specific index
  const getInputAtIndex = (type, index) => {
    if (type === 'decimal') {
      return decimalRefs[index].current;
    } else if (type === 'binary') {
      return document.getElementById(`binary-${index}`);
    } else {
      return document.getElementById(`hex-${index}`);
    }
  };

  // Handle input click to select all text
  const handleInputClick = (e) => {
    e.target.select();
  };

  // Handle keyboard navigation for any input field
  const handleKeyDown = (e, type, index, maxIndex) => {
    // Get cursor position in the current input
    const input = e.target;
    const cursorPosition = input.selectionStart;
    const hasSelection = input.selectionStart !== input.selectionEnd;
    
    switch (e.key) {
      case 'ArrowLeft':
        // Move to previous input if at the start of current input
        if (cursorPosition === 0 && index > 0) {
          e.preventDefault();
          const prevInput = getInputAtIndex(type, index - 1);
          prevInput.focus();
          // Place cursor at the end of the previous field
          setTimeout(() => {
            prevInput.selectionStart = prevInput.value.length;
            prevInput.selectionEnd = prevInput.value.length;
          }, 0);
        }
        break;
        
      case 'ArrowRight':
        // Move to next input if at the end of current input
        if (cursorPosition === input.value.length && index < maxIndex) {
          e.preventDefault();
          const nextInput = getInputAtIndex(type, index + 1);
          nextInput.focus();
          // Place cursor at the beginning of the next field
          setTimeout(() => {
            nextInput.selectionStart = 0;
            nextInput.selectionEnd = 0;
          }, 0);
        }
        break;
        
      case 'Backspace':
        // Move to previous input if at the start of current input and deleting
        if (cursorPosition === 0 && index > 0 && !hasSelection) {
          e.preventDefault();
          const prevInput = getInputAtIndex(type, index - 1);
          prevInput.focus();
          // If previous field has a value, don't delete it and place cursor at the end
          if (prevInput.value !== '') {
            setTimeout(() => {
              prevInput.selectionStart = prevInput.value.length;
              prevInput.selectionEnd = prevInput.value.length;
            }, 0);
          } else {
            // If previous field is empty, maintain the backspace behavior
            const newValue = 
              type === 'decimal' ? [...decimalNumber] :
              type === 'binary' ? [...binaryNumber] :
              [...hexNumber];
            
            newValue[index - 1] = '';
            
            if (type === 'decimal') setDecimalNumber(newValue);
            else if (type === 'binary') handleBinaryChange(index - 1, '');
            else handleHexChange(index - 1, '');
          }
        }
        break;
        
      case 'Delete':
        // Move to next input if at the end of current input and deleting forward
        if (cursorPosition === input.value.length && index < maxIndex && !hasSelection) {
          e.preventDefault();
          const nextInput = getInputAtIndex(type, index + 1);
          nextInput.focus();
          // Place cursor at the beginning of the next field
          setTimeout(() => {
            nextInput.selectionStart = 0;
            nextInput.selectionEnd = 0;
          }, 0);
        }
        break;
        
      default:
        break;
    }
  };

  // Update decimal when binary changes
  const handleBinaryChange = (index, value) => {
    if (value === '' || /^[01]$/.test(value)) {
      const newBinary = [...binaryNumber];
      newBinary[index] = value;
      
      // Convert back to decimal
      const binary = newBinary.join('');
      const decimal = parseInt(binary, 2) || 0;
      
      // Update decimal number
      const decStr = decimal.toString().padStart(3, '0');
      setDecimalNumber([...decStr].slice(0, 3));
      
      // Focus on next binary input if available
      if (value !== '' && index < binaryNumber.length - 1) {
        const nextInput = document.getElementById(`binary-${index + 1}`);
        if (nextInput) {
          nextInput.focus();
          // Select all text in the next input
          setTimeout(() => nextInput.select(), 0);
        }
      }
    }
  };

  // Update decimal when hex changes
  const handleHexChange = (index, value) => {
    if (value === '' || /^[0-9A-Fa-f]$/.test(value)) {
      const newHex = [...hexNumber];
      newHex[index] = value.toUpperCase();
      
      // Convert back to decimal
      const hex = newHex.join('');
      const decimal = parseInt(hex, 16) || 0;
      
      // Update decimal number
      const decStr = decimal.toString().padStart(3, '0');
      setDecimalNumber([...decStr].slice(0, 3));
      
      // Focus on next hex input if available
      if (value !== '' && index < hexNumber.length - 1) {
        const nextInput = document.getElementById(`hex-${index + 1}`);
        if (nextInput) {
          nextInput.focus();
          // Select all text in the next input
          setTimeout(() => nextInput.select(), 0);
        }
      }
    }
  };

  // Handle input change for each decimal digit
  const handleDecimalChange = (index, value) => {
    if (value === '' || (/^\d$/.test(value) && parseInt(value) >= 0 && parseInt(value) <= 9)) {
      const newDecimal = [...decimalNumber];
      newDecimal[index] = value;
      setDecimalNumber(newDecimal);
      
      // Move to next input automatically if a digit was entered
      if (value !== '' && index < 2) {
        const nextInput = decimalRefs[index + 1].current;
        nextInput.focus();
        // Select all text in the next input
        setTimeout(() => nextInput.select(), 0);
      }
    }
  };

  // Calculate power values for each system
  const getDecimalPowerValue = (power) => {
    return Math.pow(10, 2 - power);
  };

  const getBinaryPowerValue = (power) => {
    return Math.pow(2, binaryNumber.length - 1 - power);
  };
  
  const getHexPowerValue = (power) => {
    return Math.pow(16, hexNumber.length - 1 - power);
  };

  // Calculate the product of the power value and the digit
  const getDecimalProduct = (index) => {
    const digit = decimalNumber[index];
    return digit === '' ? '' : getDecimalPowerValue(index) * parseInt(digit, 10);
  };

  const getBinaryProduct = (index) => {
    const digit = binaryNumber[index];
    return digit === '' ? '' : getBinaryPowerValue(index) * parseInt(digit, 2);
  };

  const getHexProduct = (index) => {
    const digit = hexNumber[index];
    const digitValue = parseInt(digit, 16);
    return isNaN(digitValue) ? '' : getHexPowerValue(index) * digitValue;
  };

  // Calculate the total sum for each number system
  const getDecimalTotal = () => {
    return decimalNumber.some(d => d !== '') 
      ? decimalNumber.reduce((sum, digit, index) => {
          return sum + (digit === '' ? 0 : getDecimalProduct(index));
        }, 0)
      : '';
  };

  const getBinaryTotal = () => {
    return binaryNumber.length > 0
      ? binaryNumber.reduce((sum, digit, index) => {
          return sum + (digit === '' ? 0 : getBinaryProduct(index));
        }, 0)
      : '';
  };

  const getHexTotal = () => {
    return hexNumber.length > 0
      ? hexNumber.reduce((sum, digit, index) => {
          const value = parseInt(digit, 16);
          return sum + (isNaN(value) ? 0 : getHexPowerValue(index) * value);
        }, 0)
      : '';
  };

  // Check if there are any values in the number
  const hasValues = (numberArray) => {
    return numberArray.some(digit => digit !== '');
  };

  // Render the plus sign between digits if products are enabled
  const renderPlusSign = (index, maxIndex, hasDigit) => {
    if (index < maxIndex && showProduct && hasDigit) {
      return <div className={`plus-sign ${showProduct ? 'show' : ''}`}>+</div>;
    }
    return null;
  };

  // Render the equal sign before the total if there are values
  const renderEqualSign = (numberArray) => {
    if (hasValues(numberArray) && showTotal) {
      return <div className="equal-sign">=</div>;
    }
    return null;
  };

  // Check if a digit is a leading zero
  const isLeadingZero = (array, index) => {
    // It's a leading zero if:
    // 1. The current digit is '0'
    // 2. All digits to the left are either '0' or empty
    if (array[index] !== '0') return false;
    
    // For digits to the left, check if they're all '0' or empty
    for (let i = 0; i < index; i++) {
      if (array[i] !== '0' && array[i] !== '') {
        return false;
      }
    }
    
    // For digits to the right, check if there are any non-zero, non-empty values
    for (let i = index + 1; i < array.length; i++) {
      if (array[i] !== '0' && array[i] !== '') {
        return true; // It's a leading zero if there's a non-zero digit to the right
      }
    }
    
    // If all digits are '0' or empty, then this is considered a leading zero
    return true;
  };

  return (
    <div className="number-converter">
      <div className={`controls-container ${showMenus ? 'visible' : ''}`}>
        <div className="visibility-controls">
          <div className="visibility-control">
            <input 
              type="checkbox" 
              id="show-all"
              checked={showPowerNotation && showPowerValue && showProduct && showTotal}
              onChange={(e) => toggleAllVisibility(e.target.checked)}
            />
            <label htmlFor="show-all">Show All Details</label>
          </div>
          
          <div className="visibility-control">
            <input 
              type="checkbox" 
              id="show-power-notation"
              checked={showPowerNotation}
              onChange={(e) => setShowPowerNotation(e.target.checked)}
            />
            <label htmlFor="show-power-notation">Powers (10<sup>2</sup>)</label>
          </div>
          
          <div className="visibility-control">
            <input 
              type="checkbox" 
              id="show-power-value"
              checked={showPowerValue}
              onChange={(e) => setShowPowerValue(e.target.checked)}
            />
            <label htmlFor="show-power-value">Power Values (100×)</label>
          </div>
          
          <div className="visibility-control">
            <input 
              type="checkbox" 
              id="show-product"
              checked={showProduct}
              onChange={(e) => setShowProduct(e.target.checked)}
            />
            <label htmlFor="show-product">Products</label>
          </div>
          
          <div className="visibility-control">
            <input 
              type="checkbox" 
              id="show-total"
              checked={showTotal}
              onChange={(e) => setShowTotal(e.target.checked)}
            />
            <label htmlFor="show-total">Total</label>
          </div>
        </div>

        <button className="clear-button" onClick={handleClear}>
          Clear
        </button>
      </div>
      
      <div className={`controls-container number-system-controls ${showMenus ? 'visible' : ''}`}>
        <div className="visibility-controls">
          <div className="visibility-control">
            <input 
              type="checkbox" 
              id="show-all-systems"
              checked={showDecimal && showBinary && showHex}
              onChange={(e) => toggleAllSystems(e.target.checked)}
            />
            <label htmlFor="show-all-systems">Show All Number Systems</label>
          </div>
          
          <div className="visibility-control">
            <input 
              type="checkbox" 
              id="show-decimal"
              checked={showDecimal}
              onChange={(e) => setShowDecimal(e.target.checked)}
            />
            <label htmlFor="show-decimal">Decimal</label>
          </div>
          
          <div className="visibility-control">
            <input 
              type="checkbox" 
              id="show-binary"
              checked={showBinary}
              onChange={(e) => setShowBinary(e.target.checked)}
            />
            <label htmlFor="show-binary">Binary</label>
          </div>
          
          <div className="visibility-control">
            <input 
              type="checkbox" 
              id="show-hex"
              checked={showHex}
              onChange={(e) => setShowHex(e.target.checked)}
            />
            <label htmlFor="show-hex">Hexadecimal</label>
          </div>
        </div>
      </div>
      
      <div className="converter-container">
        {showDecimal && (
          <div className="number-system">
            <h2>Decimal (Base 10)</h2>
            <div className="number-row">
              {[0, 1, 2].map((index) => (
                <React.Fragment key={index}>
                  <div className="digit-container">
                    <div className={`power-notation ${showPowerNotation ? 'show' : ''}`}>
                      10<sup>{2 - index}</sup>
                    </div>
                    <div className="calculation">
                      <div className={`power-value ${showPowerValue ? 'show' : ''}`}>
                        {getDecimalPowerValue(index)}×
                      </div>
                      <input
                        id={`decimal-${index}`}
                        ref={decimalRefs[index]}
                        type="text"
                        maxLength="1"
                        value={decimalNumber[index]}
                        onChange={(e) => handleDecimalChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, 'decimal', index, 2)}
                        onClick={handleInputClick}
                        className={`digit-input ${isLeadingZero(decimalNumber, index) ? 'faded' : ''}`}
                        placeholder=""
                      />
                    </div>
                    <div className={`product ${showProduct ? 'show' : ''}`}>
                      = {decimalNumber[index] ? getDecimalProduct(index) : ''}
                    </div>
                  </div>
                  {renderPlusSign(index, 2, decimalNumber[index] !== '')}
                </React.Fragment>
              ))}
              {renderEqualSign(decimalNumber)}
              {hasValues(decimalNumber) && showTotal && (
                <div className="total-container">
                  <div className="total-value">{getDecimalTotal()}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {(decimalNumber.some(digit => digit !== '') && showBinary) && (
          <div className="number-system">
            <h2>Binary (Base 2)</h2>
            <div className="number-row" ref={binaryRowRef}>
              {binaryNumber.map((digit, index) => (
                <React.Fragment key={index}>
                  <div className="digit-container">
                    <div className={`power-notation ${showPowerNotation ? 'show' : ''}`}>
                      2<sup>{binaryNumber.length - 1 - index}</sup>
                    </div>
                    <div className="calculation">
                      <div className={`power-value ${showPowerValue ? 'show' : ''}`}>
                        {getBinaryPowerValue(index)}×
                      </div>
                      <input
                        id={`binary-${index}`}
                        type="text"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleBinaryChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, 'binary', index, binaryNumber.length - 1)}
                        onClick={handleInputClick}
                        className={`digit-input ${isLeadingZero(binaryNumber, index) ? 'faded' : ''}`}
                        placeholder=""
                      />
                    </div>
                    <div className={`product ${showProduct ? 'show' : ''}`}>
                      = {digit ? getBinaryProduct(index) : ''}
                    </div>
                  </div>
                  {renderPlusSign(index, binaryNumber.length - 1, digit !== '')}
                </React.Fragment>
              ))}
              {renderEqualSign(binaryNumber)}
              {hasValues(binaryNumber) && showTotal && (
                <div className="total-container">
                  <div className="total-value">{getBinaryTotal()}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {(decimalNumber.some(digit => digit !== '') && showHex) && (
          <div className="number-system">
            <h2>Hexadecimal (Base 16)</h2>
            <div className="number-row" ref={hexRowRef}>
              {hexNumber.map((digit, index) => (
                <React.Fragment key={index}>
                  <div className="digit-container">
                    <div className={`power-notation ${showPowerNotation ? 'show' : ''}`}>
                      16<sup>{hexNumber.length - 1 - index}</sup>
                    </div>
                    <div className="calculation">
                      <div className={`power-value ${showPowerValue ? 'show' : ''}`}>
                        {getHexPowerValue(index)}×
                      </div>
                      <input
                        id={`hex-${index}`}
                        type="text"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleHexChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, 'hex', index, hexNumber.length - 1)}
                        onClick={handleInputClick}
                        className={`digit-input ${isLeadingZero(hexNumber, index) ? 'faded' : ''}`}
                        placeholder=""
                      />
                    </div>
                    <div className={`product ${showProduct ? 'show' : ''}`}>
                      = {digit ? getHexProduct(index) : ''}
                    </div>
                  </div>
                  {renderPlusSign(index, hexNumber.length - 1, digit !== '')}
                </React.Fragment>
              ))}
              {renderEqualSign(hexNumber)}
              {hasValues(hexNumber) && showTotal && (
                <div className="total-container">
                  <div className="total-value">{getHexTotal()}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
