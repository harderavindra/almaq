// DeliveredChallanReport.jsx
import React, { useEffect, useState, useMemo } from 'react';
import axios from '../api/axios';          // ← adjust if your axios instance lives elsewhere
import html2pdf from 'html2pdf.js';
import { FiCalendar, FiFileText, FiPaperclip, FiTruck, FiUser } from 'react-icons/fi';

/**
 * One-liner util to format ISO -> DD-MMM-YYYY
 */
const fmtDate = iso =>
  iso ? new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const DeliveredChalanPage = () => {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSel] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const group = rows?.[0];
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { data } = await axios.get('/challans/fully-delivered');
        setRows(data.items || []);
        console.log('Delivered items:', data.items);
      } catch (err) {
        console.error('Load error:', err);
        alert('Failed to load delivered items');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter(
      r =>
        r.farmerName.toLowerCase().includes(q) ||
        r.challanNo.toLowerCase().includes(q)
    );
  }, [rows, search]);

  const toggle = id =>
    setSel(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const handlePDF = () => {
    [...selected].forEach(id => {
      const group = rows.find(x => x.uniqueId === id);
      console.log('Selected group:', group);
      if (!group) return;

      const html = `
      <div style=" padding:40px;font-family: Helvetica, Arial, sans-serif; font-size: 8pt; width: 210mm; vertical-align: top; border: 1px solid rgb(0, 0, 0);">
        <table border="1" width="100%" cellpadding="6" cellspacing="0" style="border-collapse:collapse;width:100%">
         <tbody>
          <tr>
            <td style="width: 30%; padding: 30px; vertical-align: top;">  
             <img src="almaq-logo.svg" alt="Logo" style="height:60px;margin-bottom:16px;" />
            </td>
            <td style="width: 40%; padding: 30px; text-align: left; vertical-align: top;">
              <h1 style="font-size:24px;margin:0px">Almaq Biotech LLP</h1>
              <p style="margin:0px">latur-nilang Road, Lodga</p>
              <p style="margin:0px">Latur, Maharashtra, 123456</p>
              <p style="margin:0px">Phone: +91 12345 67890</p>
            </td>
            <td style="width: 30%; padding: 30px; text-align: left; vertical-align: top;">
              <p>GST No: 27AAECA1234A1Z5</p>
              <p>NcS-TCP-Certified Lab</p>
              <p>Regd. No: 123456789</p>
              <p>Cerfication No: 987654321</p>
            </td>
         </tbody>
        </table>
      <table border="0" width="100%" cellpadding="6" cellspacing="0" style="border-collapse: collapse; width: 100%;">
        <tbody>
        <tr>
        <td style=" padding: 10px; vertical-align: top; border-bottom: 1px solid rgb(0, 0, 0); border-top: 1px solid rgb(0, 0, 0);">
        Challan Date
        </td>
        <td style=" padding: 10px; text-align: left; vertical-align: top; border-top: 1px solid rgb(0, 0, 0); border-bottom: 1px solid rgb(0, 0, 0);">
         ${group.dispatchDate || '12/12/2023'}
        </td>
        <td style=" padding: 10px; text-align: left; vertical-align: top; border-top: 1px solid rgb(0, 0, 0); border-bottom: 1px solid rgb(0, 0, 0);">
        Challan No
        </td>
        <td style=" padding: 10px; vertical-align: top; border-bottom: 1px solid rgb(0, 0, 0); border-top: 1px solid rgb(0, 0, 0);">Challan No</td>
        <td style="padding: 10px; text-align: left; vertical-align: top; border-bottom: 1px solid rgb(0, 0, 0); border-top: 1px solid rgb(0, 0, 0);">
       ${group.challanNo}
        </td>
        </tr>
        </tbody>
        </table>
        <div style="padding: 30px;">
      <h2>Challan ${group.challanNo}</h2>
      <p><strong>Farmer:</strong> ${group.farmerName}<br/>
      <strong>Address:</strong> ${group.farmerAddress}<br/>
      <strong>Vehicle:</strong> ${group.vehicle}<br/>
      <strong>Dispatch:</strong> ${fmtDate(group.dispatchDate)}</p>
      </div>
          <table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;width:100%">
            <thead><tr>
            <th style=" text-align:left; padding:10px; border-right:1px solid #000;border-bottom:1px solid #000;border-top:1px solid #000;">Plant Type</th>
            <th style=" text-align:left; padding:10px; border-right:1px solid #000;border-bottom:1px solid #000;border-top:1px solid #000;">Qty</th>
            <th style=" text-align:left; padding:10px; border-right:1px solid #000;border-bottom:1px solid #000;border-top:1px solid #000;">Rate</th>
            <th style=" text-align:right; padding:10px; border-right:1px solid #000;border-bottom:1px solid #000;border-top:1px solid #000;">Price</th>
            </tr></thead>
            <tbody>
              ${group.items
          .map(
            i =>
              `<tr>
                      <td style=" text-align:left; padding:10px; border-right:1px solid #000;border-bottom:1px solid #000;">${i.plantType}</td>
                      <td style=" text-align:left; padding:10px; border-right:1px solid #000;border-bottom:1px solid #000;">${i.quantity}</td>
                      <td style=" text-align:left; padding:10px; border-right:1px solid #000;border-bottom:1px solid #000;">₹${i.pricePerUnit}</td>
                      <td style=" text-align:right; padding:10px; border-right:1px solid #000;border-bottom:1px solid #000;">₹${i.price}</td>
                      </tr>`
          )
          .join('')}
              <tr>
              <td style=" text-align:left; padding:10px; border-right:1px solid #000;border-bottom:1px solid #000;border-top:1px solid #000;">
              <strong>Total Plants</strong>
              </td>
              <td style=" text-align:left; padding:10px; border-right:1px solid #000;border-bottom:1px solid #000;border-top:1px solid #000;">
              <strong>${group.totalPlants}</strong>
              </td>
               <td style=" text-align:left; padding:10px; border-right:1px solid #000;border-bottom:1px solid #000;border-top:1px solid #000;">
              <strong>Total Amount</strong>
              </td>
              <td style=" text-align:right; padding:10px; border-right:1px solid #000;border-bottom:1px solid #000;border-top:1px solid #000;">
              <strong>₹${group.totalPrice}</strong>
              </td>
              </tr>
              <tr>
              <td style=" text-align:left; padding:10px; border-right:1px solid #000;border-bottom:1px solid #000;border-top:1px solid #000;">
              <strong>Vehicle</strong>
              </td>
              <td style=" text-align:left; padding:10px; border-right:1px solid #000;border-bottom:1px solid #000;border-top:1px solid #000;">
              <strong>${group.vehicle}</strong>
              </td>
               <td style=" text-align:left; padding:10px; border-right:1px solid #000;border-bottom:1px solid #000;border-top:1px solid #000;">
              <strong>Vehicle Fright</strong>
              </td>
              <td style=" text-align:right; padding:10px; border-right:1px solid #000;border-bottom:1px solid #000;border-top:1px solid #000;">
              <strong>₹${group.vehicleFright}</strong>
              </td>
              </tr>
            </tbody>
          </table>
          <div style="padding: 30px; border-top: 1px solid #000;">
          आज रोजी वरील प्रमाणे मिळालेली रोटे मी वैयक्तिक रित्या प्रत्यक्ष तपासून घेतली आहेत. सदर रूपे शेतात लागवडी योग्य असून हीरोपे पूर्ण निरोगी व जातिवंत आहेत. त्याबाबत माझी कोणतीही तक्रार नाही येथून पुढे रोपांची संपूर्ण जबाबदारी मी येत आहे
          </div>
          </div>`;
      console.log('Selected html:', html);

      html2pdf()
        .set({
          margin: 0,
          filename: `${group.farmerName.replace(/\s+/g, '_')}_${group.challanNo}.pdf`,
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        })
        .from(html)
        .save();
    });
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Delivered Challan Groups</h2>

      <div className="flex items-center gap-4 mb-4">
        <input
          type="text"
          placeholder="Search farmer / challan"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border px-3 py-2 rounded w-64"
        />
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-40"
          disabled={!selected.size}
          onClick={handlePDF}
        >
          Download PDF ({selected.size})
        </button>
      </div>


      {loading ? (
        <p>Loading…</p>
      ) : (
      <div className="px-8 py-10 w-full flex-1 flex flex-col bg-white rounded-4xl shadow">
          <table className="w-full border-0  mb-4">

            {filtered.map(group => (
              <tr key={group.uniqueId} className="border-0 rounded p-4 odd:bg-gray-100/50 even:bg-white">
                <td className="p-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selected.has(group.uniqueId)}
                      onChange={() => toggle(group.uniqueId)}
                    />
                    <FiUser/><strong>{group.farmerName}</strong>  
                  </label>
                </td>
                <td className="p-3">
                  <span className="font-semibold flex gap-2 items-center "><FiFileText />{group.challanNo}</span>
                </td>
                <td>
                  <span className="font-semibold flex gap-2 items-center"><FiTruck/> {group.vehicle}</span>
                </td>
                <td>
                  <span className='flex gap-2 items-center'><FiCalendar/>{fmtDate(group.dispatchDate)}</span>
                  </td>

                <td>
                  <div className="flex gap-0 items-center">

                      {group.items.map((item, idx) => (
                        <span key={idx} className='flex gap-2'>
                          <span className="p-2">{item.plantType}-{item.quantity} -₹{item.price}</span>
                          {/* <span className="p-2 text-right">₹{item.pricePerUnit}</span> */}
                        </span>
                      ))}
                       <span colSpan="3" className=" text-right">Total</span>
                        <span className=" text-right">₹{group.totalPrice}</span>
                      </div>
                      <div className="font-semibold">
                       
                      </div>
                  
                </td>
                {/* <td className="w-50"> 
                  <div>Address: {group.farmerAddress}</div>
                </td> */}


              </tr>
            ))}
            </table>
          
        </div >
      )}
      <div>
        {group && (
          <div className="mt-8 border rounded p-6 bg-white shadow text-sm">
            <div style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontSize: '11pt', width: '210mm', verticalAlign: 'top', border: '1px solid #000' }}>
              <table border="1" width="100%" cellPadding="6" cellSpacing="0" style={{ borderCollapse: 'collapse', width: '100%', }}>
                <tbody>
                  <tr>
                    <td style={{ width: '30%', padding: '30px', verticalAlign: 'top' }}>
                      <img src="/almaq-logo.svg" alt="Logo" style={{ height: '60px', marginBottom: '16px' }} />
                    </td>
                    <td style={{ width: '40%', padding: '30px', textAlign: 'left', verticalAlign: 'top' }}>
                      <h1 style={{ fontSize: '24px', margin: '0px' }}>Almaq Biotech LLP</h1>
                      <p style={{ margin: '0px' }}>latur-nilang Road, Lodga</p>
                      <p style={{ margin: '0px' }}>Latur, Maharashtra, 123456</p>
                      <p style={{ margin: '0px' }}>Phone: +91 12345 67890</p>
                    </td>
                    <td style={{ width: '30%', padding: '30px', textAlign: 'left', verticalAlign: 'top' }}>
                      <p>GST No: 27AAECA1234A1Z5</p>
                      <p>NcS-TCP-Certified Lab</p>
                      <p>Regd. No: 123456789</p>
                      <p>Certification No: 987654321</p>
                    </td>
                  </tr>
                </tbody>
              </table>
              <table border="1" width="100%" cellPadding="6" cellSpacing="0" style={{ borderCollapse: 'collapse', width: '100%' }}>
                <tbody>
                  <tr>
                    <td style={{ width: '30%', padding: '10px', verticalAlign: 'top', borderBottom: '1px solid #000', borderTop: '1px solid #000' }}>
                      Date
                    </td>
                    <td style={{ width: '40%', padding: '10px', textAlign: 'left', verticalAlign: 'top', borderBottom: '1px solid #000', borderTop: '1px solid #000' }}>
                      {group.dispatchDate || '12/12/2023'}
                    </td>
                    <td style={{ width: '30%', padding: '10px', verticalAlign: 'top', borderBottom: '1px solid #000', borderTop: '1px solid #000' }}>
                      Challan No
                    </td>
                    <td style={{ width: '40%', padding: '10px', textAlign: 'left', verticalAlign: 'top', borderBottom: '1px solid #000', borderTop: '1px solid #000' }}>
                      {group.challanNo}
                    </td>
                  </tr></tbody>
              </table>
              <h2 style={{ marginTop: '16px' }}>Challan {group.challanNo}</h2>
              <p>
                <strong>Farmer:</strong> {group.farmerName}<br />
                <strong>Address:</strong> {group.farmerAddress}<br />
                <strong>Vehicle:</strong> {group.vehicle}<br />
                <strong>Dispatch:</strong> {fmtDate(group.dispatchDate)}
              </p>

              <table border="1" cellPadding="6" cellSpacing="0" style={{ borderCollapse: 'collapse', width: '100%' }}>
                <thead>
                  <tr><th>Plant Type</th><th>Qty</th><th>Rate</th><th>Price</th></tr>
                </thead>
                <tbody>
                  {group.items.map((i, idx) => (
                    <tr key={idx}>
                      <td>{i.plantType}</td>
                      <td>{i.quantity}</td>
                      <td>₹{i.pricePerUnit}</td>
                      <td>₹{i.price}</td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'right' }}><strong>Total</strong></td>
                    <td><strong>₹{group.totalPrice}</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveredChalanPage;
